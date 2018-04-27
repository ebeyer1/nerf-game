import React, { Component } from "react";
import { Layout, Input, InputNumber, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import * as firebase from "firebase";
import { Link } from 'react-router-dom';

// We import our firestore module
import firestore from "./firestore";

import "./Home.css";

const { Header, Footer, Content } = Layout;

class Lobby extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application
    
    console.log('lobby props', props, props.match.params.hash);
    this.state = { 
      roomHash: props.match.params.hash,
      players: [],
      roles: [],
      user: {},
      startingGame: false,
      gameStarted: false
    };
    // We want event handlers to share this context
    // this.createRoom = this.createRoom.bind(this);
    this.startGame = this.startGame.bind(this);
    
    firestore.collection("rooms").doc(this.state.roomHash).onSnapshot(snapshot => {
      console.log('heres my snapshot', snapshot);
      if (snapshot.exists) {
        var room = snapshot.data();
        this.setState({ players: room.players, roles: room.roles, creator: room.creator, totalPlayers: room.maxPlayers });
      } else {
        // Send user to a page saying this does not exist... or just show a message saying it DNE
      }
    });
    
    // TODO - do auth in a single place...
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(user => {
      console.log('user', user);
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        this.setState({loggedIn: true});
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
  
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
  
  pickOne(playerList) {
    var idx = this.getRandomInt(0, playerList.length);
    return playerList.splice(idx, 1);
  }

  // TODO - once gameStarted: true....
  //        update the room document to indicate the game started, as well as all the user roles
  //        when users detect game started either change content of page, or redirect them to /game/{hash}
  //        this page shows an error if the room is not in an active/started state
  //        this page shows the character their role with information (actions / team)
  //        the game creator can click begin
  //        add a "dead" button. Game ends when only one team remaining.
  //        first pass - don't implement any roles. Just have city vs mob. dead vs alive. City or mob wins.
  //        then implement specific roles if needed
  //        allow users to specify a name, or eventually login with google or something
  startGame() {
    if (this.state.players.length !== this.state.totalPlayers) return;
    console.log('assigning roles...');
    this.setState({ startingGame: true });
    
    var availableRoles = Object.assign([], this.state.roles);
    
    for(var i = 0; i < this.state.players.length; i++) {
      var player = this.state.players[i];
      var role = this.pickOne(availableRoles);
      console.log('player: ' + player + '. Assigned: ' + role);
    }
    
    this.setState({ startingGame: false, gameStarted: true });
  }
  
  // TODO - allow user to set info here?
  // TODO - add an /account page that lets the user set a name for their anonymous account?
  //        then display the name instead of id in views.
  render() {
    let roles = this.state.roles.join(", ");
    
    let currentUserId = '';
    if (this.state.user) {
      currentUserId = this.state.user.uid;
    }
    let creator = currentUserId === this.state.creator;
    let startGameButton = creator ? (
      <Button
        className="Lobby-start-game-button"
        size="large"
        type="primary"
        onClick={this.startGame}
        loading={this.state.startingGame}
        disabled={this.state.startingGame || (this.state.players.length !== this.state.totalPlayers)}
      >
        Start Game
      </Button>
    ) : "";
    
    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          <div>
            <hr />
            <h2>Room Code: {this.state.roomHash}</h2>
            <br />
            {startGameButton}
            <br />
            <h4>Players</h4>
            <List
              className="Home-players"
              size="large"
              bordered
              dataSource={this.state.players}
              renderItem={player => (
                <List.Item>
                  Id: {player}
                </List.Item>
              )}
            />
            <hr />
            <h4>Role Pool</h4>
            {roles}
          </div>
        </Content>
      </Layout>
    );
  }
}

export default Lobby;