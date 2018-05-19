import React, { Component } from "react";
import { Layout, Input, Button, List, Icon } from "antd";
import firebaseApp from "@firebase/app";
import { Link, Redirect } from 'react-router-dom';

// We import our firestore module
import firestore from "./firestore";

import "./Home.css";

require('firebase/auth');

const { Header, Footer, Content } = Layout;

class Account extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application
    this.state = {
      updatingName: false,
      displayName: '',
      updateComplete: false
     };
    // We want event handlers to share this context
    this.updateName = this.updateName.bind(this);

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
      this.setState({ user: user, displayName: user.displayName });
      // [START_EXCLUDE]
      // document.getElementById('quickstart-sign-in').disabled = false;
      // [END_EXCLUDE]
    });
    // [END authstatelistener]
  }

  async updateName() {
    this.setState({updatingName: true});
    
    await firebaseApp.auth().currentUser.updateProfile({
      displayName: this.state.displayName
    });
    
    // todo - update any game they are in... as a player or creator
    
    this.setState({updatingName: false, updateComplete: true});
  }

  render() {
    const successMessageStyle = {
      padding: '5px',
      backgroundColor: 'lightgreen',
      textAlign: 'center'
    };
    
    const successMessage = this.state.updateComplete ? (
      <h3 style={successMessageStyle}>Updated!</h3>
    ) : (
      <div></div>
    );
    
    const inputStyle = {
      maxWidth: '320px',
      margin: '1rem 0'
    };
    
    return (
      <Layout className="Home">
        <Content className="Home-content">
          <div>
            <Link to="/">Back to Home</Link>
          </div>
          {successMessage}
          <Input
            ref="display-name"
            className="App-display-name-input"
            autoFocus="true"
            size="large"
            id="display-name"
            addonBefore="Display Name"
            onChange={evt => this.setState({ displayName: evt.target.value })}
            value={this.state.displayName}
            disabled={this.state.updatingName}
            onPressEnter={this.updateName}
            style={inputStyle}
            required
          />
          <br />
          <Button
            className="Home-change-name-button"
            size="large"
            type="primary"
            onClick={this.updateName}
            loading={this.state.updatingName}
          >
            Update Display Name
          </Button>
        </Content>
      </Layout>
    );
  }
}

export default Account;
