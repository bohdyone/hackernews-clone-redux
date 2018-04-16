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
  storyCommentCache: ItemLookup;
  storyCache: ItemLookup;
}

type ItemLookup = {
  [key: number]: any;
};

const initState: State = {
  show: 'topStories',
  selectedStory: null,
  commentsExpanded: {},
  storyCommentCache: {},
  storyCache: {}
};

export type Action =
  | 'ShowTopStories'
  | 'ShowComments'
  | 'StoriesLoaded'
  | 'ShowChildren';

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
      // load comments
      return {
        ...state,
        show: 'comments',
        storyCommentCache: [],
        commentsExpanded: {}
      };

    case 'StoriesLoaded':
      return {
        ...state,
        storyCache: payload.stories
      };

    case 'ShowChildren':
      let show = payload.show;

      let commentsExpanded = { ...state.commentsExpanded };
      if (show) {
        commentsExpanded[payload.comment.id] = true;
        // load payload.comment.kids
        // store into comment cache
      } else {
        delete commentsExpanded[payload.comment.id];
      }

      return {
        ...state,
        commentsExpanded: commentsExpanded
      };
  }
}
