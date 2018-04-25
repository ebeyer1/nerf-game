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
      players: []
    };
    // We want event handlers to share this context
    // this.createRoom = this.createRoom.bind(this);
    
    firestore.collection("rooms").doc(this.state.roomHash).onSnapshot(snapshot => {
      console.log('heres my snapshot', snapshot);
      if (snapshot.exists) {
        var room = snapshot.data();
        this.setState({ players: room.players });
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

  // TODO - allow user to set info here?
  // TODO - add an /account page that lets the user set a name for their anonymous account?
  //        then display the name instead of id in views.
  render() {
    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
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
        </Content>
      </Layout>
    );
  }
}

export default Lobby;