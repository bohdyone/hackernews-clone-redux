import * as React from 'react';
import Comment from './Comment';
import { Item, IndexedItem } from '../Data';
import { store, State, showTopStoriesAction } from '../Update';
import { connect } from 'react-redux';
import * as _ from 'lodash';
// import _ from 'lodash';

interface Props {
  story: Item;
  comments: IndexedItem[];
  commentsExpanded: { [key: number]: boolean };
}

class CommentsComponent extends React.Component<Props, {}> {
  backToStories() {
    store.dispatch(showTopStoriesAction());
  }

  flattenItemsQuick(
    items: { [parentId: number]: IndexedItem[] },
    expanded: { [key: number]: boolean },
    parentId: number,
    depth: number = 0
  ): IndexedItem[] {
    if (depth > 0 && !(parentId in expanded)) return [];
    let children = _.sortBy(items[parentId], 'index');
    let withDescendants = _.flatMap(children, c => [
      { ...c, depth: depth },
      ...this.flattenItemsQuick(
        items,
        expanded,
        (c.item || { id: 0 }).id,
        depth + 1
      )
    ]);

    return withDescendants;
  }

  renderItemOrStub(cInfo: IndexedItem) {
    return cInfo.item ? (
      <Comment
        key={cInfo.item.id}
        comment={cInfo.item}
        depth={cInfo.depth || 0}
        showingChildren={cInfo.item.id in this.props.commentsExpanded}
      />
    ) : (
      <tr />
    );
  }

  render() {
    console.log('Comments render');
    // let forSorting = this.props.comments.map(ci=>{
    //   index = parseFloat(`${ci.parentIndex.}`)
    // })
    console.log(this.props.story);
    let grouped = _.groupBy(this.props.comments, 'parentId');
    const commentInfos = this.flattenItemsQuick(
      grouped,
      this.props.commentsExpanded,
      (this.props.story || { id: 0 }).id
    );

    return (
      <table className="comment-tree">
        <tbody>
          <tr>
            <td>
              <button onClick={this.backToStories}>Back to Stories</button>
            </td>
          </tr>
          <tr>
            <td>
              <span className="rank" />
              <a href="vote?id=16919952&how=up&auth=a4845fa2f717c8d6a56afaa5f20a18d0168a989b&goto=item%3Fid%3D16919952">
                <div className="votearrow" title="upvote" />
              </a>
              <a
                href={this.props.story.url}
                className="storylink"
                target="_blank"
              >
                {this.props.story.title}
              </a>
              <span className="sitebit comhead">
                {' '}
                (<a href="from?site=">
                  <span className="sitestr">{this.props.story.url}</span>
                </a>)
              </span>
            </td>
          </tr>
          {commentInfos.map(cInfo => this.renderItemOrStub(cInfo))}
        </tbody>
      </table>
    );
  }
}

const mapStateToProps = (state: State): Props => {
  console.log(state);
  return {
    comments: state.comments,
    commentsExpanded: state.commentsExpanded,
    story: state.selectedStory || {
      id: 0,
      by: '',
      descendants: 0,
      text: '',
      title: '',
      url: ''
    }
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const Comments = connect(mapStateToProps, mapDispatchToProps)(
  CommentsComponent
);

export default Comments;
