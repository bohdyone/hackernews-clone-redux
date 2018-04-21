import * as React from 'react';
import Comment from './Comment';
import { Item, IndexedItem } from '../Data';
import { store, State, showTopStoriesAction } from '../Update';
import { connect } from 'react-redux';
import * as _ from 'lodash';
// import _ from 'lodash';

interface Props {
  story: Item | null;
  comments: IndexedItem[];
  commentsExpanded: { [key: number]: boolean };
}

class CommentsComponent extends React.Component<Props, {}> {
  // flattenCommentTree(comments: List<item>, depth = 0) {
  //   console.log(comments);
  //   let outputComments = [];

  //   // outputComments = _.flatMapDeep(comments, commentWithChildren => {
  //   //   let levelComments = [];
  //   //   let commentWithDepth = {
  //   //     ...commentWithChildren,
  //   //     depth: depth
  //   //   };

  //   //   levelComments.push(commentWithDepth);

  //   //   if (commentWithDepth.showChildren$()) {
  //   //     levelComments.push(
  //   //       this.flattenCommentTree(commentWithDepth.children$(), depth + 1)
  //   //     );
  //   //   }

  //   //   return levelComments;
  //   // });
  //   for (let commentWithChildren of comments) {
  //     let commentWithDepth = {
  //       ...commentWithChildren,
  //       depth: depth
  //     };

  //     outputComments.push(commentWithDepth);
  //     if (commentWithDepth.showChildren$()) {
  //       let childComments = this.flattenCommentTree(
  //         commentWithDepth.children$(),
  //         depth + 1
  //       );
  //       Array.prototype.push.apply(outputComments, childComments);
  //     }
  //   }

  //   return outputComments;
  // }

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
    let withGrandChildren = _.flatMap(children, c => [
      { ...c, depth: depth },
      ...this.flattenItemsQuick(items, expanded, c.item.id, depth + 1)
    ]);

    return withGrandChildren;
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
    const props = this.props;

    return (
      <table className="comment-tree">
        <tbody>
          <tr>
            <td>
              <button onClick={this.backToStories}>Back to Stories</button>
            </td>
          </tr>
          {commentInfos.map(cInfo => (
            <Comment
              key={cInfo.item.id}
              comment={cInfo.item}
              depth={cInfo.depth || 0}
              showingChildren={cInfo.item.id in props.commentsExpanded}
            />
          ))}
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
    story: state.selectedStory
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const Comments = connect(mapStateToProps, mapDispatchToProps)(
  CommentsComponent
);

export default Comments;
