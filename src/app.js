//SCSS file
import '../scss/main.scss';

'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import { ipcRenderer } from 'electron';
import $ from 'jquery';

let socket = io('http://navigitorsite.herokuapp.com');
let socketRoom = null;

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			orgName: '',
			repoName: '',
			newestGitEvent: '',
			githubAvatar: '',
			username: '',
			teamData: [],
			localData: []
		}
		this.setAppState = this.setAppState.bind(this);
	}

	componentDidMount() {
		/* listens for a git commit event from main.js webContent.send then sends commit string to the server via socket */
		//OwnLocalCommit - Tested
		ipcRenderer.on('parsedCommit', function(event, arg){
			console.log('room: ', socketRoom)
			if(socketRoom) socket.emit('broadcastGit', {'room': socketRoom, 'data': JSON.stringify(arg, null, 1)});
			this.setAppState({ localData: this.state.localData.concat(arg) });
		}.bind(this));

		//TeamMemberLocalCommit - need to test
		socket.on('incomingCommit', function(data){
			console.log('broadcast loud and clear: ' + data);

			// Sent incoming commit to main processor to git tree
			ipcRenderer.send('newCommitToRender', JSON.parse(data));

			this.setAppState({ teamData: this.state.teamData.concat([JSON.parse(data)])});
		}.bind(this));

		//OwnGitlogLocalFile - Tested
		ipcRenderer.on('parsedCommitAll', function(event, arg){
			let data = {};
			data['localData'] = arg;
			console.log(data.localData[0])
			this.setAppState(data);
		}.bind(this));

		//TeamGitLogFromDB - need to test
		socket.on('completeDBLog', function(data){
			this.setAppState({ teamData: data });
		}.bind(this));
	}

	// Socket handling for app. Must be global to current page for ipcRenderer + React
	setSocketRoom(obj) {
		if(socketRoom) socket.emit("unsubscribe", { room: socketRoom });
		socket.emit("subscribe", { room: `${obj.orgName}.${obj.repoName}live` });
		socketRoom = `${obj.orgName}.${obj.repoName}live`;
	}

	// need to test this func being called from other components
	setAppState(obj){
		this.setState.bind(this)(obj);
		// console.log('data coming in ' +JSON.stringify(obj));
		if (obj['orgName']) {
			// console.log('yes obj is orgName '+obj['orgName']);
			this.setSocketRoom(obj);
		}
	}

	render() {
    return (
			<div>
				{React.cloneElement(this.props.children, { setAppState: this.setAppState, getAppState: this.state } )}
			</div>
    )
	}
}
