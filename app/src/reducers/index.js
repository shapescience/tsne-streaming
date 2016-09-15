import { Map, List, fromJS, toJS } from 'immutable'
import { combineReducers } from 'redux-immutable';
import {
  CONNECT, DISCONNECT, DISCONNECTED,
  POST_MESSAGE, RECEIVE_MESSAGE,
  NOTIFY, NOTIFY_END,
} from '../actions';

import { palette } from '../utils'
const color = s => {
  s.fillColor = palette(s.fillColor) 
  return s
}

const map_from_data = data => {
  const a = fromJS(data)
  return new Map(a.map(x=>[x.get('index'), x]) )
}


function samples(state=Map(), action){
  switch (action.type) {
  case RECEIVE_MESSAGE:
    let data = JSON.parse(action.msg)
    data.samples = data.samples.map(color)
    switch (data.status) {
      case 'load':
        return map_from_data(data.samples)
      case 'update':
      case 'new':
        const updates = map_from_data(data.samples)
        const earliest = Date.now() - 10 * 60 * 1000
        return state.merge(updates)
                    .filter(x=>x.get('t') > earliest)
      default:
        return state
    }
  default:
    return state
  }
}



function notify(state=Map({open:false, message: 'Oops!'}), action){
  switch (action.type) {
  case NOTIFY:
    return state.set('open', true).set('message', action.message)
  case NOTIFY_END:
    return state.set('open', false)
  default:
    return state
  }
}

function isConnected(state=false, action){
  switch (action.type) {
  case RECEIVE_MESSAGE:
    return true
  case DISCONNECTED:
    return false
  default:
    return state
  }
}

// quick and dirty
function lastAction(state = null, action) {
  return action;
}

const StreamingTSNEApp = combineReducers({
  samples,
  notify,
  isConnected,
  lastAction
})

export default StreamingTSNEApp



