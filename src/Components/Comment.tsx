import * as React from 'react';
import { Item } from '../Data';

interface Props {
  toggleChildren: any;
  comment: Item;
  showingChildren: boolean;
  spacing: number;
}

class Comment extends React.Component<Props, {}> {
  loadChildren = (yes: boolean) => {
    this.props.toggleChildren(yes);
  };

  renderCollapseControl = () => {
    const props = this.props;
    if ((props.comment.kids || []).length) {
      return (
        <a
          className="togg"
          href="javascript:void(0)"
          onClick={e => this.loadChildren(!props.showingChildren)}
          // onclick="return toggle(event, 16834700)"
        >
          [{props.showingChildren
            ? '-'
            : '+' + (props.comment.kids || []).length}]
        </a>
      );
    }
    return null;
  };

  render() {
    const props = this.props;
    const comment = this.props.comment;
    return (
      <tr>
        <td>
          <table>
            <tbody>
              <tr>
                <td className="ind">
                  <img src="s.gif" height={1} width={props.spacing} />
                </td>
                <td className="votelinks">
                  <div>
                    <a
                      id="up_16834700"
                      // onclick="return vote(event, this, &quot;up&quot;)"
                      href="vote?id=16834700&how=up&auth=b457154a2d2941cdc383ba3df1f2e738691a22dc&goto=item%3Fid%3D16826156#16834700"
                    >
                      <div className="votearrow" title="upvote" />
                    </a>
                  </div>
                </td>
                <td className="default">
                  <div style={{ marginTop: 2, marginBottom: '-10px' }}>
                    <span className="comhead">
                      <a href="user?id=nikita93" className="hnuser">
                        {comment.by}
                      </a>{' '}
                      <span className="age">
                        <a href="item?id=16834700">14 hours ago</a>
                      </span>{' '}
                      <span id="unv_16834700" />
                      <span className="par">
                        {this.renderCollapseControl()}
                      </span>{' '}
                      <span className="storyon" />
                    </span>
                  </div>
                  <br />
                  <div className="comment">
                    <span className="c00">
                      <span
                        dangerouslySetInnerHTML={{ __html: comment.text }}
                      />
                      <div className="reply">
                        {' '}
                        <p>
                          {/* <font size={1}> */}
                          <u>
                            <a href="reply?id=16834700&goto=item%3Fid%3D16826156%2316834700">
                              reply
                            </a>
                          </u>
                          {/* </font> */}
                        </p>
                      </div>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    );
  }
}

export default Comment;
