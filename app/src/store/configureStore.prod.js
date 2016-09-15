import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk'

import StreamingTSNEApp from '../reducers'

// Middleware you want to use in production:
const enhancer = applyMiddleware(thunkMiddleware);

export default function configureStore(initialState) {
  return createStore(StreamingTSNEApp, initialState, enhancer);
};
