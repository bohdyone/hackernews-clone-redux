import * as React from 'react';
import Comment from './Comment';
import { Item } from '../Data';
import { store, showChildrenAction, State } from '../Update';
import { connect } from 'react-redux';
// import _ from 'lodash';

const DEPTH_SPACER = 40;

interface Props {
  story: Item | null;
  comments: Item[];
  commentsExpanded: { [key: number]: boolean };
  show: boolean;
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

  toggleCommentChildren(comment: Item, show: boolean) {
    store.dispatch(showChildrenAction(comment, show));
  }

  render() {
    console.log('Comments render');
    const comments = this.props.comments;
    const props = this.props;

    if (!props.show) return null;

    return (
      <table className="comment-tree">
        <tbody>
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              spacing={DEPTH_SPACER * 1}
              showingChildren={comment.id in props.commentsExpanded}
              toggleChildren={this.toggleCommentChildren.bind(null, comment)}
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
    story: state.selectedStory,
    show: state.show == 'comments'
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const Comments = connect(mapStateToProps, mapDispatchToProps)(
  CommentsComponent
);

export default Comments;
