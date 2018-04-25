import React, { Component } from "react";
import { Layout, Input, Button, List, Icon } from "antd";
import * as firebase from "firebase";
import { Link, Redirect } from 'react-router-dom';

// We import our firestore module
import firestore from "./firestore";

import "./Home.css";

const { Header, Footer, Content } = Layout;

class Home extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application
    this.state = { 
      creatingRoom: false, joiningRoom: false, deletingRoom: false,
      rooms: [],
      loggedIn: false,
      user: {},
      toLobbyHash: ''
     };
    // We want event handlers to share this context
    this.deleteRoom = this.deleteRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.toggleSignIn = this.toggleSignIn.bind(this);
    // We listen for live changes to our rooms collection in Firebase
    firestore.collection("rooms").onSnapshot(snapshot => {
      let rooms = [];
      snapshot.forEach(doc => {
        const room = doc.data();
        room.id = doc.id;
        if (!room.private) rooms.push(room);
      });
      // Sort our rooms based on time added
      rooms.sort(function(a, b) {
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      // Anytime the state of our database changes, we update state
      this.setState({ rooms });
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

  async joinRoom(id) {
    if (!this.state.loggedIn) return;
    console.log('join room', id);
    if (this.state.joiningRoom) return;
    
    // TODO - if already in room, don't join...
    
    this.setState({ joiningRoom: true });
    let roomRef = await firestore
      .collection("rooms")
      .doc(id);
      
    let room = await roomRef.get();
    console.log('room ', room);
    let data = room.data();
    console.log('data ', data);
    let playerCount = data.playersInLobby || 1;
    let playerList = data.players || [];
    playerList.push(this.state.user.uid);
    await roomRef
      .update({
        playersInLobby: playerCount+1,
        players: playerList
      });
    
    this.setState({ joiningRoom: false, toLobbyHash: id });
  }
  
  async deleteRoom(id) {
    if (!this.state.loggedIn) return;
    console.log('deleting room');
    if (this.state.deletingRoom) return;
    
    this.setState({deletingRoom: true});
    
    await firestore.collection("rooms").doc(id).delete();
    
    this.setState({ deletingRoom : false});
  }
  
  async toggleSignIn() {
    if (this.state.loggedIn) {
      await firebase.auth().signOut();
    } else {
      try {
        await firebase.auth().signInAnonymously();
      }
      catch (error) {
        // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode === 'auth/operation-not-allowed') {
            alert('You must enable Anonymous auth in the Firebase Console.');
          } else {
            console.error(error);
          }
      }
    }
  }

  render() {
    if (this.state.toLobbyHash) {
      let lobbyUrl = '/lobby/' + this.state.toLobbyHash;
      return <Redirect to={lobbyUrl} />
    }
    
    // TODO - look below
    // see here for an actual login implementation: https://reactjs.org/docs/conditional-rendering.html
    // and https://github.com/firebase/quickstart-js/blob/master/auth/README.md
    const isLoggedIn = this.state.loggedIn;
    
    const buttonText = isLoggedIn ? (
      <span>Sign Out</span>
    ) : (
      <span>Sign In</span>
    );
    
    return (
      <Layout className="Home">
        <Header className="Home-header">
          <Button
            className="Home-sign-in-button"
            size="large"
            type="default"
            onClick={this.toggleSignIn}
          >
            {buttonText}
          </Button>
          <h1>NERF Game</h1>
        </Header>
        <Content className="Home-content">
          <Button
            className="Home-create-room-button"
            size="large"
            type="primary"
            href="/create"
          >
            Create Room
          </Button>
          <List
            className="Home-rooms"
            size="large"
            bordered
            dataSource={this.state.rooms}
            renderItem={room => (
              <List.Item>
                Id: {room.id}, Creator: {room.creator}
                &nbsp;
                <Button
                  onClick={evt => this.joinRoom(room.id)}
                  className="Home-join-room-button"
                  size="large"
                  type="primary"
                  loading={this.state.joiningRoom}
                >
                  Join Room with {room.playersInLobby} other(s)
                </Button>
                <Button
                  onClick={evt => this.deleteRoom(room.id)}
                  className="Home-delete-room-button"
                  size="large"
                  type="danger"
                  loading={this.state.deletingRoom}
                >
                  Delete
                </Button>
                Players: {room.players}
              </List.Item>
            )}
          />
        </Content>
        <Footer className="Home-footer">&copy; My Company</Footer>
      </Layout>
    );
  }
}

export default Home;