import React, { Component } from "react";
import { Layout, Input, InputNumber, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import { Link, Redirect } from 'react-router-dom';
import Roles from './Roles';
import Teams from './Teams';

// We import our firestore module
import firestore from "./firestore";

import "./Home.css";

const { Header, Footer, Content } = Layout;

class Game extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application

    console.log('game props', props, props.match.params.hash);
    this.state = {
      roomHash: props.match.params.hash,
      user: {},
      player: {},
      gameStarted: true // default to true unless server says otherwise
    };
    // We want event handlers to share this context
    this.iDied = this.iDied.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.selectThiefRole = this.selectThiefRole.bind(this);
    this.selectPsychicRole = this.selectPsychicRole.bind(this);

    firestore.collection("rooms").doc(this.state.roomHash).onSnapshot(snapshot => {
      console.log('heres my snapshot', snapshot);
      if (snapshot.exists) {
        let room = snapshot.data();
        console.log('room....', room);
        var player = {};
        if (this.state.user && this.state.user.uid) {
          for(var i = 0; i < room.roleArr.length; i++) {
            if (room.roleArr[i].id === this.state.user.uid) {
              player = room.roleArr[i];
              break;
            }
          }
        }

        this.setState({ playerId: player.id, playerName: player.displayName, playerRole: player.role, gameStarted: room.gameStarted, roleArr: room.roleArr,
        winningTeam: room.winningTeam, gameOver: room.gameOver, iAmDead: player.dead, roles: room.roles, players: room.players, creatorId: room.creatorId });
      } else {
        // Send user to a page saying this does not exist... or just show a message saying it DNE
      }
    });

    // TODO - do auth in a single place...
    // Listening for auth state changes.
    // [START authstatelistener]
    firebaseApp.auth().onAuthStateChanged(user => {
      console.log('user', user);
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        let playerId = this.state.playerId;
        let playerName = this.state.playerName;
        let playerRole = this.state.role;
        if (!this.state.playerId && this.state.roleArr) {
          for (var i = 0; i < this.state.roleArr.length; i++) {
            if (this.state.roleArr[i].id === uid) {
              playerId = this.state.roleArr[i].id;
              playerName = this.state.roleArr[i].displayName;
              playerRole = this.state.roleArr[i].role;
              break;
            }
          }
        }
        this.setState({loggedIn: true, playerId: playerId, playerName: playerName, playerRole: playerRole});
        // [START_EXCLUDE]
        // document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
        // document.getElementById('quickstart-sign-in').textContent = 'Sign out';
        // document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
        // [END_EXCLUDE]
      } else {
        // User is signed out.
        this.setState({loggedIn: false});
        // [START_EXCLUDE]
        // document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
        // document.getElementById('quickstart-sign-in').textContent = 'Sign in';
        // document.getElementById('quickstart-account-details').textContent = 'null';
        // [END_EXCLUDE]
      }
      this.setState({ user: user });
      // [START_EXCLUDE]
      // document.getElementById('quickstart-sign-in').disabled = false;
      // [END_EXCLUDE]
    });
    // [END authstatelistener]
  }

  async iDied() {
    this.setState({iAmDying:true});

    let roomRef = await firestore
      .collection("rooms")
      .doc(this.state.roomHash);

    let room = await roomRef.get();

    let roomData = room.data();

    let died = false;
    let updatedRoleArr = roomData.roleArr.map(role => {
      if (role.id === this.state.user.uid) {
        died = true;
        role.dead = true;
      }
      return role;
    });
    
    let martyrDead = updatedRoleArr.find(r => r.role === 'martyr' && r.dead === true);
    let winningTeam = '';
    if (martyrDead) {
      winningTeam = 'martyr';
    }

    if (winningTeam === '') {
      let alivePlayers = updatedRoleArr.filter(r => r.dead !== true); // accounts for r.dead being null

      let remainingTeams = alivePlayers.map(p => {
        var roleId = p.role;
        var role = Roles.find(r => r.id === roleId);
        return role.team;
      });
      let mobPlayers = remainingTeams.filter(t => t === "mob");
      // if all remaining players are mob, then mob wins
      if (mobPlayers.length === remainingTeams.length) {
        winningTeam = 'mob';
      } else if (mobPlayers.length > 0) { // if not all, but some remaining players are mob, game is still going
        winningTeam = '';
      } else {
        var cityPlayers = remainingTeams.filter(t => t === "city");
        // if all remaining players are city; city wins.
        if (cityPlayers.length === remainingTeams.length) {
          winningTeam = 'city';
        }
        var neutralPlayers = remainingTeams.filter(t => t === "neutral");
        // if only martyr is alive... no one wins.
        if (neutralPlayers.length === remainingTeams.length) {
          winningTeam = 'No One';
        }
      }
    }

    let gameOver = winningTeam !== '';
    await roomRef
      .update({
        roleArr: updatedRoleArr,
        winningTeam: winningTeam,
        gameOver: gameOver
      });

      this.setState({winningTeam: winningTeam, gameOver: gameOver, iAmDead: died, iAmDying: false});
  }

  async resetGame() {
    this.setState({resettingGame:true});

    let roomRef = await firestore
      .collection("rooms")
      .doc(this.state.roomHash);

    let room = await roomRef.get();

    let roomData = room.data();

    var availableRoles = Object.assign([], this.state.roles);

    var roleArr = [];
    for(var i = 0; i < this.state.players.length; i++) {
      var player = this.state.players[i];
      var role = this.pickOne(availableRoles);
      console.log('player: ' + player.id + '. Assigned: ' + role);
      roleArr.push({ id: player.id, displayName: player.displayName, role });
    }

    await roomRef
      .update({
        roleArr: roleArr,
        winningTeam: '',
        gameOver: false
      });

    this.setState({resettingGame: false});
  }

  // todo - getRandomInt and pickOne shouldn't be duplicated in Game and Lobby
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  pickOne(roleList) {
    var idx = this.getRandomInt(0, roleList.length);
    return roleList.splice(idx, 1)[0];
  }
  
  selectThiefRole(user) {
    var selectedThiefRoles = this.state.selectedThiefRoles || [];
    if (selectedThiefRoles.length >= 2) {
      return;
    }
    selectedThiefRoles.push(user);
    let chosenRole = '';
    if (selectedThiefRoles.length >= 2) {
      let idx = this.getRandomInt(0, 2);
      let name = selectedThiefRoles[idx];
      let role = this.state.roleArr.find(r => r.displayName === name);
      let actualRole = Roles.find(r => r.id === role.role);
      chosenRole = actualRole.name;
    }
    
    this.setState({selectedThiefRoles: selectedThiefRoles, chosenThiefRole: chosenRole});
  }
  
  selectPsychicRole(user) {
    var selectedPsychicRoles = this.state.selectedPsychicRoles || [];
    if (selectedPsychicRoles.length >= 2) {
      return;
    }
    selectedPsychicRoles.push(user);
    let chosenRole = '';
    if (selectedPsychicRoles.length >= 2) {
      let idx = this.getRandomInt(0, 2);
      let name = selectedPsychicRoles[idx];
      let role = this.state.roleArr.find(r => r.displayName === name);
      let actualRole = Roles.find(r => r.id === role.role);
      chosenRole = actualRole.name;
    }
    
    this.setState({selectedPsychicRoles: selectedPsychicRoles, chosenPsychicRole: chosenRole});
  }

  render() {
    if (!this.state.gameStarted) {
      let lobbyUrl = '/lobby/' + this.state.roomHash;
      return <Redirect to={lobbyUrl} />
    }

    let roleInfo = Roles.find(r => r.id === this.state.playerRole);
    let winCondition = '';
    if (roleInfo) {
      winCondition = roleInfo.specialWinCondition;
      if (!winCondition) {
        let teamInfo = Teams.find(t => t.id === roleInfo.team);
        winCondition = teamInfo.winCondition;
      }
    }
    let roleInfoDisplay = roleInfo ? (
      <div>
        <strong>Role</strong>: {roleInfo.name}
        <br />
        <strong>Team</strong>: {roleInfo.team}
        <br />
        <strong>Win Condition</strong>: {winCondition}
        <br />
        <strong>Description</strong>: {roleInfo.description}
        <br />
        <strong>Abilities</strong>: {roleInfo.abilities}
        <br />
        <strong>Traits</strong>: {roleInfo.traits}
      </div>
    ) : ""; // support the whole arrays at some point.

    let currentUserId = '';
    if (this.state.user) {
      currentUserId = this.state.user.uid;
    }
    let creator = currentUserId === this.state.creatorId;
    let resetGameButton = creator ? (
      <div>
        <Button
          className="Game-reset-button"
          size="large"
          type="default"
          onClick={this.resetGame}
          loading={this.state.resettingGame}
          disabled={this.state.resettingGame}
        >
          Reset Game
        </Button> (Re-assign roles)
      </div>
    ) : ( <div></div> );

    let winningTeam = (roleInfo && roleInfo.team === this.state.winningTeam) ||
                      (roleInfo && roleInfo.id === this.state.winningTeam);
    let gameWonStyle = {
      backgroundColor: winningTeam ? 'lightgreen' : 'indianred'
    };
    
    let gameOverMessage = this.state.gameOver ? (
      <div>
        <h1 style={gameWonStyle}>Game Over: {this.state.winningTeam} Wins!</h1>
        {resetGameButton}
      </div>
    ) : '';

    let deadButtonText = this.state.iAmDead ? 'Dead :/' : 'I died';

    let roleAction = (<span></span>);
    if (roleInfo && roleInfo.name === 'Citizen') {
      roleAction = (
        <div>
          Citizen has no special action.
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Detective') {
      roleAction = (
        <div>
          Flash Badge to learn someones role
          <br /><img src="/assets/detective-badge.png" />
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Undercover Cop') {
      roleAction = (
        <div>
          <ul>
            <li>Attends mob meeting</li>
            <li>Can NOT shoot mob members, or city loses</li>
            <li>Can only speak to mob members</li>
          </ul>
        </div>
      );
    } /*else if (roleInfo && roleInfo.name === 'Witch') {
      roleAction = (
        <div>
          NEED TO IMPLEMENT
        </div>
      );
    }*/ else if (roleInfo && roleInfo.name === 'Mob Recruit') {
      roleAction = (
        <div>
          Mob Recruit has no special action.
        </div>
      );
    } /*else if (roleInfo && roleInfo.name === 'Mob Capo') {
      roleAction = (
        <div>
          Mob Capo
        </div>
      );
    }*/ else if (roleInfo && roleInfo.name === 'Zombie') {
      roleAction = (
        <div>
          You may RISE FROM THE DEAD!
          <br />
          You can no longer use your weapon. You can kill someone by touching them.
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Mole') {
      let mobPlayers = this.state.roleArr.filter(r => {
        let role = Roles.find(x => x.id === r.role);
        return role.team === 'mob' && r.displayName !== this.state.user.displayName;
      });
      let listStyle = {
        listStyleType: 'none',
        marginTop: '8px'
      };
      roleAction = (
        <div>
          <strong>Knows who other mob members are:</strong>
          <ol style={listStyle}>
            {mobPlayers.map(p => {
              return <li>{p.displayName}</li>;
            })}
          </ol>
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Informant') {
      let rolesOtherThanMe = this.state.roleArr.filter(r => {
        return r.displayName !== this.state.user.displayName;
      });
      let randomUserIdx = this.getRandomInt(0, rolesOtherThanMe.length);
      let randomUser = rolesOtherThanMe[randomUserIdx];
      var pct = this.getRandomInt(0, 99);
      let randomRole = '';
      if (pct >= 40) {
        let role = Roles.find(r => r.id === randomUser.role);
        randomRole = role.name;
      } else {
        let otherUsers = rolesOtherThanMe.filter(r => {
          return r.displayName !== randomUser.displayName;
        });
        let otherUserIdx = this.getRandomInt(0, otherUsers.length);
        let otherUser = otherUsers[otherUserIdx];
        let otherRole = Roles.find(r => r.id === otherUser.role);
        randomRole = otherRole.name;
      }
      roleAction = (
        <div>
          Word on the street is <strong>{randomUser.displayName}</strong> is a <strong>{randomRole}</strong>...
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Martyr') {
      roleAction = (
        <div>
          Win if you die.
          <br />
          <br />
          Cannot Kill.
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Thief') {
      let rolesOtherThanMe = this.state.roleArr.filter(r => {
        return r.displayName !== this.state.user.displayName;
      });
      let listStyle = {
        listStyleType: 'none',
        marginTop: '8px'
      };
      roleAction = (
        <div>
          Select two people below, and get one of their roles...
          <ol style={listStyle}>
            {rolesOtherThanMe.map(p => {
              let selectedThiefRoles = this.state.selectedThiefRoles || [];
              let selected = selectedThiefRoles.indexOf(p.displayName) >= 0;
              let selectedStyle = {
                cursor: 'pointer',
                marginTop: '4px'
              };
              if (selected) {
                selectedStyle.backgroundColor = 'lightgreen';
              }
              return <li style={selectedStyle} onClick={() => this.selectThiefRole(p.displayName)}>{p.displayName}</li>;
            })}
          </ol>
          <br />
          Chosen people: {(this.state.selectedThiefRoles || []).join(', ')}
          <br />
          Leaked role: {this.state.chosenThiefRole}
        </div>
      );
    } else if (roleInfo && roleInfo.name === 'Psychic') {
      let rolesOtherThanMe = this.state.roleArr.filter(r => {
        return r.displayName !== this.state.user.displayName;
      });
      let listStyle = {
        listStyleType: 'none',
        marginTop: '8px'
      };
      roleAction = (
        <div>
          Select two people below, and get one of their roles...
          <ol style={listStyle}>
            {rolesOtherThanMe.map(p => {
              let selectedPsychicRoles = this.state.selectedPsychicRoles || [];
              let selected = selectedPsychicRoles.indexOf(p.displayName) >= 0;
              let selectedStyle = {
                cursor: 'pointer',
                marginTop: '4px'
              };
              if (selected) {
                selectedStyle.backgroundColor = 'lightgreen';
              }
              return <li style={selectedStyle} onClick={() => this.selectPsychicRole(p.displayName)}>{p.displayName}</li>;
            })}
          </ol>
          <br />
          Chosen people: {(this.state.selectedPsychicRoles || []).join(', ')}
          <br />
          Leaked role: {this.state.chosenPsychicRole}
        </div>
      );
    }
    
    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          <div>
            <h2>Room Code: {this.state.roomHash}</h2>
            <br />
            {gameOverMessage}
            <h4>Role Info</h4>
            {roleInfoDisplay}
            
            <br />
            <Button
              className="Lobby-i-died-button"
              size="large"
              type="danger"
              onClick={this.iDied}
              loading={this.state.iAmDying}
              disabled={this.state.iAmDying || this.state.iAmDead}
            >
              {deadButtonText}
            </Button>
            <br />
            
            <div className="role-action-container">
              {roleAction}
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}

export default Game;
