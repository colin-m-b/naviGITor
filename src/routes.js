import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const { Router, Route, Link, hashHistory, IndexRoute } = require('react-router');

import App from './app';

import Main from './Pages/main';
import Login from './Pages/login';
import Signup from './Pages/signup';
import TeamLogin from './Pages/teamLogin';

import TeamGitTree from './gitTree/teamGitTree';
import LocalGitTree from './gitTree/localGitTree';
import TerminalView from './terminal/terminal.js';
import TeamAnalytics from './analytics.js';
import LocalGraph from './localGraph';
import Logo from './logopage';
import Profile from './profilePage';



export default class Routes extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router history = {hashHistory}>
         <Route path = "/" component = {App}>
           <IndexRoute component = {Login} />
           <Route path = "Signup" component = {Signup} />
           <Route path = "TeamLogin" component = {TeamLogin} />
           <Route path = "Main" component = {Main}>
             <IndexRoute component = {Logo} />
             <Route path = "TeamGitTree" component = {TeamGitTree} />
             <Route path = "LocalGitTree" component = {LocalGitTree} />
             <Route path = "TeamAnalytics" component = {TeamAnalytics} />
             <Route path = "Terminal" component = {TerminalView} />
             <Route path = "LocalGraph" component = {LocalGraph} />
             <Route path = "Profile" component = {Profile} />
           </Route>
         </Route>
      </Router>
    );
  }
}


ReactDOM.render((<Routes />), document.getElementById('app'));
