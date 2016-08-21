//SCSS file
import '../scss/main.scss';

'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import ajax from 'superagent';
import Term from './terminal/terminal.js'
import Visualization from './visualization';
import { ipcRenderer } from 'electron';

/* listens for an git commit event from main.js webContent.send
 then sends commit string to the server via socket */
ipcRenderer.on('commitMade', function(event, arg){
	let socket = io('http://localhost:3000');
	socket.emit('broadcastCommit', JSON.stringify(arg, null, 4))
});

/* listens for an git branch checkout event from main.js webContent.send
 then sends commit string to the server via socket */
ipcRenderer.on('changedBranches', function(event, arg){
	let socket = io('http://localhost:3000');
	socket.emit('broadcastBranch', JSON.stringify(arg, null, 4))
});


class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			message: []
		}
		this._handleData = this._handleData.bind(this);
	}

	componentWillMount() {
    this.socket = io('http://localhost:3000');
	}

	componentDidMount() {
		this.socket.on('test', this._handleData);
		this.socket.on('incomingCommit', this._handleData);
  }

	_handleData(dataObj) {
		let data = JSON.parse(dataObj);
		console.log("handledata", data);
		this.setState({ message: this.state.message.concat(data) });
	}

	_handleSubmit(e) {
		e.preventDefault();

		let orgName = document.getElementById('login-org').value;
		let repoName = document.getElementById('login-repo').value;

		ajax.get(`https://api.github.com/repos/${orgName}/${repoName}/commits`)
			.end((error, response) => {
				if (!error && response) {
					let apiData = response.body.map(function(item){
						return {
							name: item.commit.author.name,
							date: item.commit.author.date,
							message: item.commit.message
						}
					}).reverse();
					this.setState({ message: apiData });
					console.log(apiData);
				} else {
					console.log('error fetching Github data', error);
				}
			}
		);

		// Save for now to transfer to main process later
		// let githubLogin = {
		// 	orgName: orgName,
		// 	repoName: repoName
		// }

		// ipcRenderer.send('githubLogin', githubLogin);
	}

	render() {
    return (
			<div className="container_wholePage">
				<h1>naviGITor</h1>
					<form onSubmit={this._handleSubmit.bind(this)} className="login">
						<input id="login-org" placeholder="Github Organization" type="text" />
						<input id="login-repo" placeholder="Repo Name" type="text" />
						<button className="login-submit" type="submit">Submit</button>
					</form>
      		<div className="container_visualizationAndTerminal">
						<Visualization message={ this.state.message } />
						<Term />
      		</div>
			</div>
    );
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
