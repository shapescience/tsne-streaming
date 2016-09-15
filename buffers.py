# -*- coding: utf-8 -*-
"""
Contains classes for our data and a buffer
for "fake" streaming embedding computation.
"""
import datetime
from collections import deque
import numpy as np
# To manage the buffer we use a dequeue:
# - insertion/deletion of new/stale events should be fast
# - random access in the middle of the queue are slow
#     ? problematic when update many buffer elements (eg on embedding recalc).
#     > we use iteration for that vs one-at-a-time, so should be still O(N).
#     > lower level we'd love to just store pointers to embeddings so don't care.
#     ? wasn't able to locate the python implementation?
# - a list could fit our needs as well as computing embeddings is MUCH slower.
# - in the frontend we currently just use a dict and filter/merge as needed...


class Sample:
    """ Represent one of the data samples we want to compute an embedding on. """
    def __init__(self, data, time, scaled, xy=None, index=None, label=-1):
        self.data = data          # preprocessing pipeline deals with it.
        self.scaled = scaled      # numpy vector, obtained via a sklearn pipeline
        self.time = time          # datetime.datetime
        self.xy = xy              # (float, float)
        self.index = index        # int
        self.label = float(label) # int
    def to_dict(self):
        return {'t': self.time.timestamp() * 1000,
                'x': float(self.xy[0]),
                'y': float(self.xy[1]),
                'index': self.index,
                'fillColor': self.label,
               }

class SamplesBuffer:
    """ Buffer for Samples.
    Exposes methods to extend/0-pop data and update their embeddings.
    """
    def __init__(self, samples, pipeline):
        """ Constructor from an iterator of samples and a sklearn pipeline. """
        self.pipeline = pipeline
        now = datetime.datetime.now()
        samplize = lambda s, i: Sample(s[0],
                                       now,
                                       pipeline.transform(s[0].reshape(1, -1)),
                                       None, i, s[1])
        self.q = deque(samplize(s, i) for i, s in enumerate(samples))
        # the data keeps flowing, but we keep track of "absolute" indexes
        self.index_first = 0
        # we also remember when our last embedding computation stopped
        self.index_last_embedding = 0

    def to_dict(self):
        return [s.to_dict() for s in self.q]

    def __len__(self):
        return len(self.q)

    def update_xys(self, mapper_x, mapper_y):
        """ Update newest embeddings using mappers. """
        updates = []
        for index, s in enumerate(self.q):  # might as just start from idx0
            index_absolute = self.index_first + index
            if index_absolute > self.index_last_embedding:
                # we could skip recomputing the most recent xys
                x = mapper_x.predict(s.scaled)
                y = mapper_y.predict(s.scaled)
                s.xy = (x, y)
                updates.append(s)
        return [s.to_dict() for s in updates]

    def X(self):
        """
        Return scaled data for all samples and the index of the 1st sample.
        """
        array = np.array([s.scaled for s in self.q])
        return array.reshape(-1, array.shape[2]), self.index_first

    def X_2d(self):
        """ Return 2d data for all samples. """
        return np.array([s.xy for s in self.q]).reshape(-1, 2)

    def update2d(self, X_2d, index_first):
        """ Update 2d date when we get results for the embedding. """
        # if we had all indexes as input we could save ourselves some pain
        #    [idx-----------=]  X_2d
        #          [idx--------------------]  buffer
        #     delta*_updates_*
        delta_index = self.index_first - index_first
        updates = []
        for idx, s in enumerate(self.q):
            if delta_index + idx >= len(X_2d):  # too old
                break
            s.xy = X_2d[delta_index + idx,]
            updates.append(s.to_dict())
        self.index_last_embedding = self.index_first + idx
        # slice-indexing is not supported in deques. We can't do:
        #   return [s.to_dict() for s in self.q[:(idx+1)] ]
        return updates


    def extend(self, sample, mapper_x, mapper_y):
        """ Add a new data sample to the buffer.
        It expects the samples to be a tuple (object,label)
        """
        scaled = self.pipeline.transform(sample[0].reshape(1, -1))
        x = mapper_x.predict(scaled)
        y = mapper_y.predict(scaled)
        now = datetime.datetime.now()
        index = len(self.q) + self.index_first
        sample = Sample(sample[0], now, scaled, (x, y), index, sample[1])
        self.q.extend([sample])
        return [sample.to_dict()]


    def remove_old(self, seconds):
        """ Remove stale data from the buffer. """
        now = datetime.datetime.now()
        # with a dict you'd have to scan
        # with a list you'd need an index not to pay n^2 time for many 0-pops
        while (now - self.q[0].time).total_seconds() > seconds:
            self.q.popleft()
            self.index_first = self.index_first + 1
