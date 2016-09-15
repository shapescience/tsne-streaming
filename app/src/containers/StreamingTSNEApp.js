import React, { Component } from 'react'
var shallowCompare = require('react-addons-shallow-compare');
import { connect } from 'react-redux'

import Timeline from '../components/Timeline'
import Projection2D from '../components/Projection2D'
import { CONNECT, DISCONNECT } from '../actions'
import { getSamples, getVolume } from '../selectors'

import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import LinearProgress from 'material-ui/LinearProgress';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
const style = {
  margin: 20
};

class StreamingTSNEApp extends Component {
  constructor(props) {
    super(props)
    this.handleRequestClose = this.handleRequestClose.bind(this)
  }

  componentDidMount() {
    const { dispatch, selected } = this.props
    const { pathname } = this.props.location
    dispatch({type: CONNECT})
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  handleRequestClose(oid) {
    this.props.dispatch(notify())
  }

  render() {
    const {isConnected, open, message,
           selected, onSelect,
           samples, volume } = this.props
    return (
      <div>
        { !isConnected ? <LinearProgress mode="indeterminate" /> : <div />}
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle text={`${samples.count()} samples`} />
          </ToolbarGroup>
        </Toolbar>
        <Paper style={style}>
          <Timeline
            key={"timeline"}
            volume={volume}
            style={style}
          />
        </Paper>
        <Projection2D
        key={"2D"}
        samples={samples}
        style={style}
        />
        <Snackbar
          open={open}
          message={message}
          autoHideDuration={3000}
          onRequestClose={this.handleRequestClose}
          style={{fontFamily: 'Roboto, sans-serif'}}
        />
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    samples: getSamples(state),
    volume: getVolume(state),
    isConnected: state.get('isConnected'),
    open: state.get('notify').get('open'),
    message: state.get('notify').get('message'),
  }
}

export default connect(
  mapStateToProps
)(StreamingTSNEApp)
