import React from "react";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from "./Home";

import "./App.css";

const App = () => (
  <Router>
    <Route path="/" component={Home} />
  </Router>
)

export default App;