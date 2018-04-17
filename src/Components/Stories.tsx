import * as React from 'react';
import Story from './Story';
import { State } from '../Update';
import { connect } from 'react-redux';

interface Props {
  stories: any[];
  show: boolean;
}

class StoriesComponent extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props);
    this.state = {
      stories: []
    };
  }

  componentDidMount() {}

  render() {
    const stories = this.props.stories;
    console.log(stories);
    console.log('Stories render');
    if (!this.props.show) return null;

    return stories.map(story => (
      <tr key={story.id} className="athing">
        <Story story={story} />
      </tr>
    ));
  }
}

const mapStateToProps = (state: State): Props => {
  console.log(state);
  return {
    stories: state.stories,
    show: state.show == 'topStories'
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const Stories = connect(mapStateToProps, mapDispatchToProps)(StoriesComponent);

export default Stories;
