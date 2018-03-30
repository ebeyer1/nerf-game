import React from "react";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from "./Home";
import Create from "./Create";

import "./App.css";

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/create" component={Create} />
    </div>
  </Router>
)

export default App;