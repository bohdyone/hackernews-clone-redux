import * as React from 'react';
import { store, showCommentsAction } from '../Update';
import { Item } from '../Data';

interface Props {
  story: Item;
  rank: number;
}

class Story extends React.PureComponent<Props, {}> {
  clickDiscuss(story: any, e: any) {
    e.preventDefault();
    store.dispatch(showCommentsAction(story));
  }
  render() {
    const story = this.props.story;
    return (
      <td className="title">
        <span className="rank">{this.props.rank}</span>
        <a href={story.url} className="storylink" rel="nofollow">
          {story.title}
        </a>
        <span className="sitebit comhead">
          {story.descendants}
          (<a href="discuss" onClick={e => this.clickDiscuss(story, e)}>
            Discuss
          </a>)
        </span>
      </td>
    );
  }
}

export default Story;
