import * as React from 'react';
import { store, showCommentsAction } from '../Update';

interface Props {
  story: any;
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
        <span className="rank" />{' '}
        <div>
          <a
            // onclick="return vote(event, this, &quot;up&quot;)"
            href="vote?id=16836735&how=up&auth=0fd9c4bde2725dcfacb843cdf873bcc55b41244e&goto=newest"
          >
            <div className="votearrow" title="upvote" />
          </a>
        </div>
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
