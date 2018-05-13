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
    this.beginMatch = this.beginMatch.bind(this);
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

console.log('loaded beginsAt', room.beginsAt, new Date(room.beginsAt));
        this.setState({ playerName: player.player, playerRole: player.role, gameStarted: room.gameStarted, rolesArr: room.roleArr, creator: room.creator,
            beginsAt: room.beginsAt,
            matchLength: room.matchLength
         });
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
        if (!this.state.player && this.state.rolesArr) {
          for (var i = 0; i < this.state.rolesArr.length; i++) {
            if (this.state.rolesArr[i].player === uid) {
              player = this.state.rolesArr[i];
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

  async beginMatch() {
    this.setState({ beginningMatch: true });

    let roomRef = await firestore
      .collection("rooms")
      .doc(this.state.roomHash);

    var now = new Date();
    now.setSeconds(now.getSeconds() + 10);
    await roomRef
      .update({
        activeGame: true,
        beginsAt: now,
        matchLength: 300
      });

    this.setState({ beginningMatch: false, activeGame: true, beginsAt: now, matchLength: 300 });
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

    let currentUserId = '';
    if (this.state.user) {
      currentUserId = this.state.user.uid;
    }
    let creator = currentUserId === this.state.creator;
    let beginMatchButton = creator ? (
      <Button
        className="Lobby-begin-match-button"
        size="large"
        type="primary"
        onClick={this.beginMatch}
        loading={this.state.beginningMatch}
        disabled={this.state.beginningMatch || this.state.activeGame}
      >
        Begin Match
      </Button>
    ) : "";

    var now = new Date();
    console.log('this.beginsAt', this.state.beginsAt);
    var timer = this.state.beginsAt ? (this.state.beginsAt - now) / 1000 : "";
    console.log('timer', timer);
    var endTimer = '';
    if (this.state.beginsAt) {
      var endDate = this.state.beginsAt;
      endDate.setSeconds(endDate.getSeconds() + this.state.matchLength);
      endTimer = (endDate - now) / 1000;
    }
    // TODO - figure out how to show the timer couting down in react
    console.log('endTimer', endTimer);

    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          <div>
            <h2>Room Code: {this.state.roomHash}</h2>
            <br />
            Click this button to begin playing the game...
            {beginMatchButton}
            <br />
            Begin time: {timer}
            End timer: {endTimer}
            <br />
            <h4>Role Info</h4>
            {roleInfoDisplay}
          </div>
        </Content>
      </Layout>
    );
  }
}

export default Game;
