import React, { Component } from "react";
import { Layout, Input, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import { Link, Redirect } from 'react-router-dom';

// We import our firestore module
import firestore from "./firestore";

import "./Home.css";

require('firebase/auth');

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
    firebaseApp.auth().onAuthStateChanged(user => {
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
    if (!playerList.find(p => p.id === this.state.user.uid)) {
      playerList.push({id: this.state.user.uid, displayName: this.state.user.displayName});
      await roomRef
        .update({
          playersInLobby: playerCount+1,
          players: playerList
        });
    }

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
      await firebaseApp.auth().signOut();
    } else {
      try {
        await firebaseApp.auth().signInAnonymously();
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

    const greetingStyle = {
      float: 'left',
      color: 'whitesmoke'
    };
    
    const accountLinkStyle = {
      fontSize: '10px',
      marginLeft: '4px'
    };
    
    const greeting = isLoggedIn ? (
      <div style={greetingStyle}>
        <span>Hello, {(this.state.user || {}).displayName || 'Guest User'}</span>
        <Link to="/account" style={accountLinkStyle}>(Edit name)</Link>
      </div>
    ) : (
      <div style={greetingStyle}>Please sign in</div>
    );
    
    const loggedInButtonStyle = {
      float: 'right'
    }
    
    const buttonText = isLoggedIn ? (
      <span>Sign Out</span>
    ) : (
      <span>Sign In</span>
    );
      
    let hasDisplayName = isLoggedIn ?
      this.state.user && this.state.user.displayName && this.state.user.displayName.length > 0 :
      false;
      
    const createMessage = isLoggedIn ?
      (hasDisplayName ? (<span></span>) : (<span>Please set a display name</span>)) :
      (<span>Please sign in</span>);

    return (
      <Layout className="Home">
        <Header className="Home-header">
          {greeting}
          <Button
            className="Home-sign-in-button"
            size="default"
            type="default"
            style={loggedInButtonStyle}
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
            disabled={!isLoggedIn || !hasDisplayName}
          >
            Create Room
          </Button>
          {createMessage}
          <List
            className="Home-rooms"
            size="large"
            bordered
            dataSource={this.state.rooms}
            renderItem={room => (
              <List.Item>
                Id: {room.id}, Creator: {room.creatorName || 'Guest User'}
                &nbsp;
                <Button
                  onClick={evt => this.joinRoom(room.id)}
                  className="Home-join-room-button"
                  size="large"
                  type="primary"
                  loading={this.state.joiningRoom}
                  disabled={!isLoggedIn || !hasDisplayName}
                >
                  Join Room with {room.playersInLobby} other(s)
                </Button>
                <Button
                  onClick={evt => this.deleteRoom(room.id)}
                  className="Home-delete-room-button"
                  size="large"
                  type="danger"
                  loading={this.state.deletingRoom}
                  disabled={!isLoggedIn}
                >
                  Delete
                </Button>
                Players: {room.players.map(p => p.displayName)}
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
