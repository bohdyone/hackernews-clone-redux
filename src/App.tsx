import * as React from 'react';
import './App.css';
import { store, showTopStoriesAction, ViewType, State } from './Update';
import Stories from './Components/Stories';
import Comments from './Components/Comments';
import { connect } from 'react-redux';

interface Props {
  show: ViewType;
}

class AppComponent extends React.Component<Props> {
  componentDidMount() {
    store.dispatch(showTopStoriesAction());
  }

  private renderMainView() {
    if (this.props.show == 'topStories') return <Stories />;
    if (this.props.show == 'comments') return <Comments />;
    return null;
  }

  public render() {
    return <div className="App">{this.renderMainView()}</div>;
  }
}

const mapStateToProps = (state: State): Props => {
  console.log(state);
  return {
    show: state.show
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;
