import { createStore } from 'redux';

type ViewType = 'topStories' | 'comments';

interface Story {
  story: any;
  comments: any[];
}

interface State {
  show: ViewType;
  selectedStory: Story | null;
  commentsExpanded: { [key: number]: boolean };
}

const initState: State = {
  show: 'topStories',
  selectedStory: null,
  commentsExpanded: {}
};

export type Action = 'ShowTopStories' | 'ShowComments' | 'ShowChildren';

export const store = createStore(reducer, initState);

export function reducer(
  state: State,
  action: { type: Action; payload: any }
): State {
  // an error about the return type means you missed a case

  const payload = action.payload;
  switch (action.type) {
    case 'ShowTopStories':
      return {
        ...state,
        show: 'topStories'
      };
    case 'ShowComments':
      return {
        ...state,
        show: 'topStories'
      };
    case 'ShowChildren':
      let show = payload.show;

      let commentsExpanded = { ...state.commentsExpanded };
      if (show) {
        commentsExpanded[payload.comment.id] = true;
      } else {
        delete commentsExpanded[payload.comment.id];
      }
      //load payload.comment.kids

      return {
        ...state,
        commentsExpanded: commentsExpanded
      };
  }
}
