import React, { Component } from "react";
import { Layout, Input, InputNumber, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import { Link, Redirect } from 'react-router-dom';
import Roles from './Roles';

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
    // this.createRoom = this.createRoom.bind(this);
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
        
        this.setState({ playerName: player.player, playerRole: player.role, gameStarted: room.gameStarted, rolesArr: room.roleArr });
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

  render() {
    if (!this.state.gameStarted) {
      let lobbyUrl = '/lobby/' + this.state.roomHash;
      return <Redirect to={lobbyUrl} />
    }

    let roleInfo = Roles.find(r => r.id === this.state.playerRole);
    let roleInfoDisplay = roleInfo ? (
      <div>
        Role: {roleInfo.name}
        <br />
        Team: {roleInfo.team}
      </div>
    ) : "";

    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          <div>
            <h2>Room Code: {this.state.roomHash}</h2>
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
