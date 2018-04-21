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
        <a href={item.url} target="_blank" className="storylink" rel="nofollow">
          {item.title}
        </a>
        <span className="sitebit comhead">
          (<a href="discuss" onClick={e => this.clickDiscuss(item, e)}>
            Discuss - {item.descendants} comments
          </a>)
        </span>
      </>
    ) : (
      <span>
        <img width="32" height="6" src="./loader2.gif" />
      </span>
    );
  }

  render() {
    console.log('Single Story render');
    return (
      <td className="title">
        <span className="rank">{this.props.rank}.</span>
        {this.renderStoryOrStub(this.props.story)}
      </td>
    );
  }
}

export default Story;
