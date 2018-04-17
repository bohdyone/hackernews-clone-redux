import * as React from 'react';
import './App.css';
import { store, showTopStoriesAction } from './Update';

import logo from './logo.svg';
import Stories from './Components/Stories';

class App extends React.Component {
  componentDidMount() {
    store.dispatch(showTopStoriesAction());
  }
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Stories />
      </div>
    );
  }
}

export default App;
