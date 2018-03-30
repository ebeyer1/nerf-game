import React, { Component } from "react";
import { Layout, Input, InputNumber, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import * as firebase from "firebase";
import { Link } from 'react-router-dom';

// We import our firestore module
import firestore from "./firestore";

import "./Home.css";

const { Header, Footer, Content } = Layout;

// TODO - potentially just load <Create /> in Home.js, and pass in user info into Create
// TODO - or just have creator use /create and others use /join or /lobby/xyz
class Create extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application
    this.state = { 
      creatingRoom: false,
      roomCreated: false,
      maxPlayers: 1,
      players: [],
      roomHash: '',
      loggedIn: false,
      user: {}
     };
    // We want event handlers to share this context
    this.createRoom = this.createRoom.bind(this);

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
  
  getHash() {
    const length = 4;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
  
  async createRoom() {
    if (!this.state.loggedIn) return;
    if (this.state.maxPlayers < 2) return;
    console.log('creating room', this.state.creatingRoom);
    if (this.state.creatingRoom) return;
    // Set a flag to indicate loading
    this.setState({ creatingRoom: true });
    // Add a new todo from the value of the input
    let that = this;
    console.log('make req');
    var newRoomHash = this.getHash();
    var players = [this.state.user.uid];
    this.setState({ roomHash: newRoomHash, players: players });
    console.log('about the create with hash...', newRoomHash);
    await firestore.collection("rooms").doc(newRoomHash).set({
      timestamp: firebaseApp.firestore.FieldValue.serverTimestamp(),
      private: false,
      maxPlayers: this.state.maxPlayers,  
      creator: this.state.user.uid,
      players: players
    });
    console.log('req finished');
    // Remove the loading flag and clear the input
    this.setState({ creatingRoom: false, roomCreated: true });
    
    
    // TODO - navigate to new lobby page
    // this.context.router.transitionTo('/lobby/' + this.state.roomHash);
  }

  render() {
    const roomInfo = this.state.roomHash ?
      (
        <div>
          <hr />
          <h2>Room Code: {this.state.roomHash}</h2>
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
        </div>
      ) : (
        <div></div>
      );
      
    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          <InputNumber
            ref="add-todo-input"
            className="App-add-todo-input"
            autoFocus="true"
            min="1"
            max="50"
            size="large"
            step="1"
            onChange={val => this.setState({ maxPlayers: val })}
            value={this.state.maxPlayers}
            disabled={this.state.roomCreated}
            required
          />
          <Button
            className="Home-create-room-button"
            size="large"
            type="primary"
            onClick={this.createRoom}
            loading={this.state.creatingRoom}
            disabled={this.state.roomCreated}
          >
            Create Room
          </Button>
          {roomInfo}
        </Content>
      </Layout>
    );
  }
}

export default Create;