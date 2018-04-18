import * as React from 'react';
import Comment from './Comment';
import { Item, IndexedItem } from '../Data';
import { store, showChildrenAction, State } from '../Update';
import { connect } from 'react-redux';
import * as _ from 'lodash';
// import _ from 'lodash';

const DEPTH_SPACER = 40;

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

  toggleCommentChildren(comment: IndexedItem, show: boolean) {
    console.log({ toggleCommentChildren: comment });
    store.dispatch(showChildrenAction(comment, show));
  }

  flattenItems(items: IndexedItem[], depth = 1): IndexedItem[] {
    let levelItems = items.filter(i => i.depth == depth);
    let otherItems = _.difference(items, levelItems);
    levelItems = _.orderBy(levelItems, 'index');
    return _.flatMap(levelItems, i => [
      i,
      ...this.flattenItems(otherItems, depth + 1).filter(
        c => c.parentId == i.item.id
      )
    ]);
  }

  flattenItemsQuick(
    items: { [parentId: number]: IndexedItem[] },
    parentId: number
  ): IndexedItem[] {
    let children = _.sortBy(items[parentId], 'index');
    let withGrandChildren = _.flatMap(children, c => [
      c,
      ...this.flattenItemsQuick(items, c.item.id)
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
      (this.props.story || { id: 0 }).id
    );
    const props = this.props;

    return (
      <table className="comment-tree">
        <tbody>
          {commentInfos.map(cInfo => (
            <Comment
              key={cInfo.item.id}
              comment={cInfo.item}
              spacing={DEPTH_SPACER * (cInfo.depth || 0)}
              showingChildren={cInfo.item.id in props.commentsExpanded}
              toggleChildren={this.toggleCommentChildren.bind(null, cInfo)}
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
