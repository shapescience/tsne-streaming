# -*- coding: utf-8 -*-
"""Compute intensive functions.

They will be run in their own thread rather than blocking the event-loop.
"""
from sklearn.manifold import TSNE
from sklearn.svm import SVR

def tsne(X):
    """Compute a tSNE embedding."""
    return TSNE(init='pca', n_components=2, # for stability
                method='barnes_hut',        # default anyway but good to know
                n_iter=1000,
                verbose=0,
               ).fit_transform(X)

def mappers(X, X_2d):
    """Learn approximate x and y mappers for the given embedding."""
    # see below how to choose parameters
    svr_x = SVR(kernel='rbf', gamma=0.01, C=1e2, epsilon=0.1)
    svr_y = SVR(kernel='rbf', gamma=0.01, C=1e2, epsilon=0.1)
    mapper_x = svr_x.fit(X, X_2d[:, 0])
    mapper_y = svr_y.fit(X, X_2d[:, 1])
    return mapper_x, mapper_y


if __name__ == '__main__':
    # calibration procedure - sorry it's much automated
    from sklearn.grid_search import GridSearchCV
    import numpy as np
    from data import s_buffer

    def calibrate(X, y):
        """ Finds best parameters for SVR. """
        svr = GridSearchCV(SVR(kernel='rbf', gamma=0.1), cv=5,
                           param_grid={"C": [1e0, 1e1, 1e2, 1e3],
                                       "gamma": np.logspace(-2, 2, 5)},
                           n_jobs=4).fit(X, y)
        sv_ratio = svr.best_estimator_.support_.shape[0] / len(X)
        print(svr.best_estimator_)
        print("Support vector ratio: %.3f" % sv_ratio)

    XX, _ = s_buffer.X()
    XX_2d = tsne(XX)
    calibrate(XX, XX_2d[:, 0])
    calibrate(XX, XX_2d[:, 1])
