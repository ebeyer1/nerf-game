import React, { Component } from "react";
import { Layout, Input, Button, List, Icon } from "antd";
import firebase from "@firebase/app";

// We import our firestore module
import firestore from "./firestore";

import "./App.css";

const { Header, Footer, Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application
    this.state = { creatingRoom: false, joiningRoom: false, deletingRoom: false, rooms: [] };
    // We want event handlers to share this context
    this.createRoom = this.createRoom.bind(this);
    this.deleteRoom = this.deleteRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    // We listen for live changes to our todos collection in Firebase
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

  async joinRoom(id) {
    console.log('join room', id);
    if (this.state.joiningRoom) return;
    
    this.setState({ joiningRoom: true });
    let roomRef = await firestore
      .collection("rooms")
      .doc(id);
      
    let room = await roomRef.get();
    console.log('room ', room);
    let data = room.data();
    console.log('data ', data);
    let playerCount = data.playersInLobby || 1;
    await roomRef
      .update({
        playersInLobby: playerCount+1
      });
    
      this.setState({ joiningRoom: false });
  }
  
  async createRoom() {
    console.log('creating room', this.state.creatingRoom);
    if (this.state.creatingRoom) return;
    // Set a flag to indicate loading
    this.setState({ creatingRoom: true });
    // Add a new todo from the value of the input
    var that = this;
    console.log('make req');
    await firestore.collection("rooms").doc(this.getHash()).set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      private: false,
      playersInLobby: 1
    });
    console.log('req finished');
    // Remove the loading flag and clear the input
    this.setState({ creatingRoom: false });
  }
  
  async deleteRoom(id) {
    console.log('deleting room');
    if (this.state.deletingRoom) return;
    
    this.setState({deletingRoom: true});
    
    await firestore.collection("rooms").doc(id).delete();
    
    this.setState({ deletingRoom : false});
  }

  render() {
    return (
      <Layout className="App">
        <Header className="App-header">
          <h1>NERF Game</h1>
        </Header>
        <Content className="App-content">
          <Button
            className="App-create-room-button"
            size="large"
            type="primary"
            onClick={this.createRoom}
            loading={this.state.creatingRoom}
          >
            Create Room
          </Button>
          <List
            className="App-rooms"
            size="large"
            bordered
            dataSource={this.state.rooms}
            renderItem={room => (
              <List.Item>
                {room.id}
                &nbsp;
                <Button
                  onClick={evt => this.joinRoom(room.id)}
                  className="App-join-room-button"
                  size="large"
                  type="primary"
                  loading={this.state.joiningRoom}
                >
                  Join Room with {room.playersInLobby} other(s)
                </Button>
                <Button
                  onClick={evt => this.deleteRoom(room.id)}
                  className="App-delete-room-button"
                  size="large"
                  type="danger"
                  loading={this.state.deletingRoom}
                >
                  Delete
                </Button>
              </List.Item>
            )}
          />
        </Content>
        <Footer className="App-footer">&copy; My Company</Footer>
      </Layout>
    );
  }
}

export default App;