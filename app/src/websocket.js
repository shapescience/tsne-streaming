export default class WS {
  constructor(url, dispatcher) {
    this.websocket = new WebSocket(`ws://${url}`);
    this.dispatcher = dispatcher
    this.websocket.onmessage = function (event) {
      dispatcher(event.data)
    }
  }

  postMessage(text) {
    this.websocket.send(
      text
    );
  }

  close() {
    this.websocket.close();
  }

}
