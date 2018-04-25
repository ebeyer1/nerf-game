import React from "react";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from "./Home";
import Create from "./Create";
import Lobby from './Lobby';

import "./App.css";

// TODO - put login outside the <route>'s. pass user into in as a prop? look up how to do
const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/lobby/:hash" component={Lobby} />
    </div>
  </Router>
)

export default App;