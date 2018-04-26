import React, { Component } from "react";
import { Layout, Input, InputNumber, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import * as firebase from "firebase";
import { Link, Redirect } from 'react-router-dom';
import RoleList from './RoleList';

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
      maxPlayers: 2,
      players: [],
      roomHash: this.getHash(),
      loggedIn: false,
      user: {},
      toLobbyHash: '',
      roles: []
     };
    // We want event handlers to share this context
    this.createRoom = this.createRoom.bind(this);
    this.handleRoleSelected = this.handleRoleSelected.bind(this);

    // TODO - next steps:
    // TODO - in the lobby view, the creator can manage... start game, add players, destroy lobby
    //        destroying lobby takes user back to home page    
    
    firestore.collection("rooms").doc(this.state.roomHash).onSnapshot(snapshot => {
      console.log('heres my snapshot', snapshot);
      if (snapshot.exists) {
        var room = snapshot.data();
        this.setState({ players: room.players });
      }
    });
    
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
    if (this.state.roles.length !== this.state.maxPlayers + 3) return;
    console.log('creating room', this.state.creatingRoom);
    if (this.state.creatingRoom) return;
    // Set a flag to indicate loading
    this.setState({ creatingRoom: true });
    // Add a new todo from the value of the input
    let that = this;
    console.log('make req');
    var players = [this.state.user.uid];
    this.setState({ players: players });
    console.log('about the create with hash...', this.state.roomHash);
    await firestore.collection("rooms").doc(this.state.roomHash).set({
      timestamp: firebaseApp.firestore.FieldValue.serverTimestamp(),
      private: false,
      maxPlayers: this.state.maxPlayers,  
      creator: this.state.user.uid,
      players: players,
      roles: this.state.roles
    });
    console.log('req finished');
    // Remove the loading flag and clear the input
    this.setState({ creatingRoom: false, roomCreated: true, toLobbyHash: this.state.roomHash });
    
    
    // TODO - navigate to new lobby page
    // this.context.router.transitionTo('/lobby/' + this.state.roomHash);
  }
  
  handleRoleSelected(role) {
    console.log('inside handleRoleSelected', role);
    var roleList = this.state.roles || [];
    var index = roleList.indexOf(role.id);
    console.log('role lsit and index', roleList, index);
    if (index === -1) {
      console.log('adding');
      if (roleList.length < this.state.maxPlayers + 3) {
        roleList.push(role.id);
      }
    } else {
      console.log('removing');
      roleList.splice(index, 1);
    }
    this.setState({ roles: roleList });
  }

  render() {
    if (this.state.toLobbyHash) {
      let lobbyUrl = '/lobby/' + this.state.toLobbyHash;
      return <Redirect to={lobbyUrl} />
    }
    
    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          <label for="player-count"><strong>Player Count</strong>&nbsp;</label>
          <InputNumber
            ref="add-todo-input"
            className="App-add-todo-input"
            autoFocus="true"
            min="1"
            max="50"
            size="large"
            step="1"
            id="player-count"
            addonBefore="Player Count"
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
          <hr />
          <div>Select a number of roles from the list below equal to the number of players + 3</div>
          <RoleList onSelectRole={this.handleRoleSelected} selectedRoles={this.state.roles}></RoleList>
        </Content>
      </Layout>
    );
  }
}

export default Create;