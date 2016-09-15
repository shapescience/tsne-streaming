# -*- coding: utf-8 -*-
"""
Loads data and warms a preprocessing pipeline.
"""
from itertools import cycle
from sklearn import datasets, cross_validation
from sklearn.preprocessing import RobustScaler # StandardScaler
from sklearn.pipeline import Pipeline
from buffers import SamplesBuffer

data = datasets.load_digits()
# data = datasets.fetch_covtype()

X = data.data
y = data.target
print("loaded {} samples with {} features".format(X.shape[0], X.shape[1]))

# we populate the buffer with some data to start
start_pc = 0.20 #%


# the rest will be in the stream
X_start, X_stream, y_start, y_stream = cross_validation.train_test_split(X, y, test_size=1-start_pc)
# for convience we arrange data samples as (data, target)
start = zip(X_start, y_start)
stream_ = zip(X_stream, y_stream)
# if no y is available use:
# stream = cycle( (x, None) for x in X_stream )
stream = cycle(stream_)


# note: we better have representative features in the first training batch
# big issue if we use a dict-vect in the pipeline: we could miss rare events
pipeline = Pipeline([
    ('scaler', RobustScaler()),
]).fit(X_start)

s_buffer = SamplesBuffer(start, pipeline)
