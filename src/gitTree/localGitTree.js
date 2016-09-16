import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import $ from 'jquery';
import { ipcRenderer } from 'electron';
import createGitTree from './createGitTree';

const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');

export default class LocalGitTree extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		let gitTreeId = 'local-git-tree',
				localGitHistory = this.props.getAppState.localData,
				localGitNodes = [],
				localGitEdges = [];

		// loop through all local git activity, and store as nodes
		for (var i = 0; i < localGitHistory.length; i++) {

			// if node has merge event, add merge class to add css properties
			if (localGitHistory[i].eventType === 'commit (merge)') {
				localGitNodes.push({
					data: {
						ancestor: localGitHistory[i]['parent'][0],
						author: localGitHistory[i]['user'],
						id: localGitHistory[i]['SHA'],
						bg: localGitHistory[i]['avatarUrl'],
						event: localGitHistory[i]['eventType'],
						commit: localGitHistory[i]['message'],
						nameAndMessage: localGitHistory[i]['user'].substring(0, localGitHistory[i]['user'].indexOf('<') - 1) + ': ' + ': ' + localGitHistory[i]['message'],
						date: new Date(localGitHistory[i]['time'] * 1000).toString().slice(0,15),
						time: new Date(localGitHistory[i]['time'] * 1000).toString().slice(16,21)
					},
					grabbable: false,
					classes: 'merge'
				});
			}

			// all other nodes are normal
			else if (localGitHistory[i].SHA) {
				localGitNodes.push({
					data: {
						ancestor: localGitHistory[i]['parent'][0],
						author: localGitHistory[i]['user'].trim(),
						id: localGitHistory[i]['SHA'],
						event: localGitHistory[i]['eventType'],
						commit: localGitHistory[i]['message'],
						nameAndMessage: localGitHistory[i]['user'].substring(0, localGitHistory[i]['user'].indexOf('<') - 1) + ': ' + localGitHistory[i]['message'],
						date: new Date(localGitHistory[i]['time'] * 1000).toString().slice(0,15),
						time: new Date(localGitHistory[i]['time'] * 1000).toString().slice(16,21),
						diff: localGitHistory[i]['diff'],
						diffStats: localGitHistory[i]['diffStats'],
						bg: localGitHistory[i]['avatarUrl']
					},
					grabbable: false
				});
			}
		}
		for (var i = 0; i < localGitHistory.length; i++) {
			// loop through git merge activity and connect current node with parent nodes
			if (localGitHistory[i].eventType.trim() === 'merge') {
				if(localGitHistory[i].parent[0] !== localGitHistory[i].parent[1]) {
					localGitEdges.push({
						data: {
							source: localGitHistory[i].parent[0],
							target: localGitHistory[i].parent[1]
						}
					});
				}
			}
			// if committed a fixed merge conflict, add merge class to edges
			else if (localGitHistory[i].eventType === 'commit (merge)') {
				localGitEdges.push({
					data: {
						source: localGitHistory[i].parent[0],
						target: localGitHistory[i].SHA
					},
					classes: 'merge'
				});
			}

			// loop through all other events and connect current node to parent node
			// else if (localGitHistory[i]['event'] !== 'checkout') {
			else if(!localGitHistory[i].eventType.trim() === 'merge' || !/^checkout/.test(localGitHistory[i]['event'])) {
				localGitEdges.push({
					data: {
						source: localGitHistory[i].parent[0],
						target: localGitHistory[i].SHA
					}
				});
			}
		}

		/**
		 * Listens for local git commit event - 'parsedCommit' - from index.js
		 * @param {String} - event
		 * @param {Object} - incomingGit
		 * @return {Object} - returns abstracted object values with commit information
		 */
		ipcRenderer.on('parsedCommit', function(event, localGit){
			cy.nodes().removeClass('new');
			cy.edges().removeClass('new');

			cy.add([
				{
			    data: {
			    	ancestor: localGit['parent'][0],
			    	author: localGit['user'],
			    	id: localGit['SHA'],
			    	event: localGit['eventType'],
			    	bg: localGitHistory[i]['avatarUrl'],
			    	commit: localGit['message'],
			    	nameAndMessage: localGit['user'] + ': ' + localGitHistory[i]['message'],
						date: new Date(localGitHistory[i]['time'] * 1000).toString().slice(0,15),
						time: new Date(localGitHistory[i]['time'] * 1000).toString().slice(16,21),
						diff: localGit['diff'],
						diffStats: localGit['diffStats']
			    }
				},
				{
			    data: {
			    	id: 'edge ' + localGit.message,
			    	source: localGit.parent[0],
			    	target: localGit.SHA
			    }
				}
			])
			.addClass('new');

			cy.layout({
				name: 'dagre',
				animate: true,
				fit: true,
				animationDuration: 1000,
			});
		});

		createGitTree(gitTreeId, localGitNodes, localGitEdges);
	}

	render() {
		return (
			<div className="git-tree-container">
				<div className="git-tree-body">
					<div id="local-git-tree"></div>
				</div>
			</div>
		);
	}
}
