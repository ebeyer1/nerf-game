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
    // this.startGame = this.startGame.bind(this);

    firestore.collection("rooms").doc(this.state.roomHash).onSnapshot(snapshot => {
      console.log('heres my snapshot', snapshot);
      if (snapshot.exists) {
        let room = snapshot.data();
        console.log('room....', room);
        var player = {};
        if (this.state.user && this.state.user.uid) {
          for(var i = 0; i < room.roleArr.length; i++) {
            if (room.roleArr[i].player === this.state.user.uid) {
              player = room.roleArr[i];
              break;
            }
          }
        }

        this.setState({ playerName: player.player, playerRole: player.role, gameStarted: room.gameStarted, roleArr: room.roleArr,
        winningTeam: room.winningTeam, gameOver: room.gameOver, iAmDead: player.dead });
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
        let player = this.state.player;
        if (!this.state.player && this.state.roleArr) {
          for (var i = 0; i < this.state.roleArr.length; i++) {
            if (this.state.roleArr[i].player === uid) {
              player = this.state.roleArr[i];
              break;
            }
          }
        }
        this.setState({loggedIn: true, playerName: player.player, playerRole: player.role,});
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
      if (role.player === this.state.user.uid) {
        died = true;
        role.dead = true;
      }
      return role;
    });

    let alivePlayers = updatedRoleArr.filter(r => r.dead !== true); // accounts for r.dead being null

    let remainingTeams = alivePlayers.map(p => {
      var roleId = p.role;
      var role = Roles.find(r => r.id === roleId);
      return role.team;
    });
    let mobPlayers = remainingTeams.filter(t => t === "mob");
    let winningTeam = '';
    if (mobPlayers.length === remainingTeams.length) {
      winningTeam = 'mob';
    } else if (mobPlayers.length > 0) {
      winningTeam = '';
    } else {
      var neutralPlayers = remainingTeams.filter(t => t === "neutral");
      if (neutralPlayers.length >= 1) {
        winningTeam = 'Martyr'; // only using martyr bc they are the only neutral at the moment.
      } else {
        winningTeam = 'city';
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
        Role: {roleInfo.name}
        <br />
        Team: {roleInfo.team}
        <br />
        Win Condition: {winCondition}
        <br />
        Description: {roleInfo.description}
        <br />
        Abilities: {roleInfo.abilities}
        <br />
        Traits: {roleInfo.traits}
      </div>
    ) : ""; // support the whole arrays at some point.

    let gameOverMessage = this.state.gameOver ? (
      <h1>Game Over: {this.state.winningTeam} Wins!</h1>
    ) : '';

    let deadButtonText = this.state.iAmDead ? 'Dead :/' : 'I died';

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
          </div>
        </Content>
      </Layout>
    );
  }
}

export default Game;
