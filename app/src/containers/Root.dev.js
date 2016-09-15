import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from '../components/App';
import DevTools from '../DevTools';
// import ReactPerfTool from 'react-perf-tool';
// import Perf from 'react-addons-perf';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <div>
          <App />
          <DevTools />
          {/*<ReactPerfTool perf={Perf} />*/}
        </div>
      </Provider>
    );
  }
}
