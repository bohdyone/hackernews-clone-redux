import * as React from 'react';
import * as _ from 'lodash';
import Story from './Story';
import { State } from '../Update';
import { connect } from 'react-redux';
import { IndexedItem } from '../Data';

interface Props {
  stories: IndexedItem[];
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
    // reorder and render
    const stories = _.sortBy(this.props.stories, 'index').map(is => is.item);

    console.log(stories);
    console.log('Stories render');
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
    stories: state.stories
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const Stories = connect(mapStateToProps, mapDispatchToProps)(StoriesComponent);

export default Stories;
