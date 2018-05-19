import React from "react";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from "./Home";
import Create from "./Create";
import Lobby from './Lobby';
import Game from './Game';
import Account from './Account';

import "./App.css";

// Original: https://nrempel.com/guides/react-firebase-ant-design/
// Router: https://medium.com/@pshrmn/a-simple-react-router-v4-tutorial-7f23ff27adf

// TODO - put login outside the <route>'s. pass user into in as a prop? look up how to do
const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/lobby/:hash" component={Lobby} />
      <Route path="/game/:hash" component={Game} />
      <Route path="/account" component={Account} />
    </div>
  </Router>
)

export default App;
