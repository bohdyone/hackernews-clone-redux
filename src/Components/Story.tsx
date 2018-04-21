import * as React from 'react';
import { store, showCommentsAction } from '../Update';
import { Item } from '../Data';

interface Props {
  story?: Item;
  rank: number;
}

class Story extends React.PureComponent<Props, {}> {
  clickDiscuss(story: any, e: any) {
    e.preventDefault();
    store.dispatch(showCommentsAction(story));
  }

  renderStoryOrStub(item?: Item) {
    return item ? (
      <>
        <a href={item.url} className="storylink" rel="nofollow">
          {item.title}
        </a>
        <span className="sitebit comhead">
          {item.descendants}
          (<a href="discuss" onClick={e => this.clickDiscuss(item, e)}>
            Discuss
          </a>)
        </span>
      </>
    ) : (
      <span>...</span>
    );
  }

  render() {
    console.log('Single Story render');
    return (
      <td className="title">
        <span className="rank">{this.props.rank}</span>
        {this.renderStoryOrStub(this.props.story)}
      </td>
    );
  }
}

export default Story;
