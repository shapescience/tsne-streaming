import React, { Component } from 'react'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'

import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router'

import injectTapEventPlugin from 'react-tap-event-plugin'; // Needed for onTouchTap
injectTapEventPlugin();
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const muiTheme = getMuiTheme({});


import AppBar from 'material-ui/AppBar';
// https://design.google.com/icons/
import FindInPage from 'material-ui/svg-icons/action/find-in-page';

import StreamingTSNEApp from '../containers/StreamingTSNEApp';

class MyAppBar extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
    this.handleClose = this.handleClose.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
  }
  componentDidMount(){
    this.state = {open: false};
  }

  handleClose() { this.setState({open: false}) };
  handleToggle() { this.setState({open: !this.state.open}) };
  render() {
    return (
      <div>
        <AppBar
          title="Streaming tSNE"
          onLeftIconButtonTouchTap={this.handleToggle}
        />
        <Drawer open={this.state.open} docked={false} onRequestChange={(open) => this.setState({open})}>
          <MenuItem
            onTouchTap={this.handleClose}
            leftIcon={<FindInPage />}
            containerElement={<Link to="#" activeStyle={{ backgroundColor: 'rgba(0,0,0,0.098)' }}/>}>
            View Samples
          </MenuItem>
        </Drawer>
        {this.props.children}
      </div>
    )
  }
}


export default class App extends Component {
    render() {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
            <Router history={hashHistory}>
              <Route path="/" component={MyAppBar} >
                <IndexRoute component={StreamingTSNEApp} />
              </Route>
            </Router>
      	</MuiThemeProvider>
      )
    };
}
