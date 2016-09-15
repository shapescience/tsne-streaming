import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux'

import Root from './containers/Root'
import configureStore from './store/configureStore';
const store = configureStore();

// handling websocket-redux 
import {
  POST_MESSAGE, CONNECT,
  DISCONNECT, DISCONNECTED
} from './actions'
import { receiveMessage, notify } from './actions'
import { URL } from './config'
import WS from './websocket'
const sock = {
  URL,
  ws: null,
  wsDipatcher: (msg) => {
    return store.dispatch(receiveMessage(msg));
  },
  wsListener: () => {
    const lastAction = store.getState().get('lastAction');
    switch (lastAction.type) {
      case POST_MESSAGE:
        return sock.ws.postMessage(lastAction.text);
      case CONNECT:
        return sock.startWS();
      case DISCONNECT:
        store.dispatch(notify('Disconnected'))
        return sock.stopWS();
      default:
        return;
    }
  },
  stopWS: () => {
    console.log('stop ws')
    sock.ws.close();
    sock.ws = null
    store.dispatch({type: DISCONNECTED})
  },
  startWS: () => {
    if(!!sock.ws) sock.ws.close();
    console.log('starting ws')
    const print = (e) => console.log(e.data)
    sock.ws = new WS(sock.URL, sock.wsDipatcher)
  }
};
store.subscribe(() => sock.wsListener());

render(
  <Root store={store} />,
  document.getElementById('root')
)
