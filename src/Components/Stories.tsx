import * as React from 'react';
import * as _ from 'lodash';
import Observer from 'react-intersection-observer';

import Story from './Story';
import { State, store, loadItemsAction, ItemFlag } from '../Update';
import { connect } from 'react-redux';
import { IndexedItem } from '../Data';

interface Props {
  stories: IndexedItem[];
  itemsLoading: ItemFlag;
}

class StoriesComponent extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props);
    this.state = {
      stories: []
    };
  }

  componentDidMount() {}

  storyInView(item: IndexedItem, inView: boolean) {
    // console.log({ storyInView: { inView: inView, item: item } });
    // if (inView && !this.props.itemsLoading[item.id])
    if (inView && !item.item) store.dispatch(loadItemsAction([item]));
  }

  render() {
    // reorder and render
    const items = _.sortBy(this.props.stories, 'index');

    console.log(items);
    console.log('Stories render');
    return items.map(item => (
      <tr key={item.id} className="story">
        <Observer>
          {inView => {
            this.storyInView(item, inView);
            return <Story story={item.item} rank={item.index + 1} />;
          }}
        </Observer>
      </tr>
    ));
  }
}

const mapStateToProps = (state: State): Props => {
  console.log(state);
  return {
    stories: state.stories,
    itemsLoading: state.itemsLoading
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const Stories = connect(mapStateToProps, mapDispatchToProps)(StoriesComponent);

export default Stories;
