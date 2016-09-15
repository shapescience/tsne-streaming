export const CONNECT = 'CONNECT';
export const DISCONNECT = 'CONNECT';
export const POST_MESSAGE = 'POST_MESSAGE';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';

export const receiveMessage = (msg) => {
  return function (dispatch) {
    dispatch({ type: RECEIVE_MESSAGE, msg })
  }
}


export const NOTIFY_END = 'NOTIFY_END'
export const NOTIFY = 'NOTIFY'
export const notify = message => {
  return function (dispatch) {
    dispatch({ type: message ? NOTIFY: NOTIFY_END, message })
  }
}
