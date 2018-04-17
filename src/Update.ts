import { applyMiddleware, createStore } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { getTopStories$, Item, getCommentsForStory$ } from './Data';

type ViewType = 'topStories' | 'comments';

// interface Story {
//   story: any;
//   comments: any[];
// }

export interface State {
  show: ViewType;
  selectedStory: Item | null;
  commentsExpanded: { [key: number]: boolean };
  storyCommentCache: ItemLookup;
  storyCache: ItemLookup;
  stories: Item[];
  comments: Item[];
}

export type ItemLookup = {
  [key: number]: Item;
};

const initState: State = {
  show: 'topStories',
  selectedStory: null,
  commentsExpanded: {},
  storyCommentCache: {},
  storyCache: {},
  stories: [],
  comments: []
};

// type ShowTopStories = {
//   type: 'ShowTopStories';
// };

type ActionTypes =
  | 'ShowTopStories'
  | 'ShowComments'
  // | 'StoryListLoaded'
  | 'StoriesLoaded'
  | 'CommentsLoaded'
  | 'ShowChildren';

export type Action = {
  type: ActionTypes;
};

type ActionType = Action & {
  payload: any;
};

export function reducer(
  state: State,
  action: { type: ActionTypes; payload: any }
): State {
  // an error about the return type means you missed a case
  const payload = action.payload;

  if (state === undefined) return initState;

  switch (action.type) {
    case 'ShowTopStories':
      // load stories
      return {
        ...state,
        show: 'topStories',
        stories: []
      };

    case 'ShowComments':
      // load comments
      return {
        ...state,
        show: 'comments',
        storyCommentCache: {},
        commentsExpanded: {},
        comments: []
      };

    case 'StoriesLoaded':
      let newStories = [...state.stories];
      newStories.push(...payload);
      return {
        ...state,
        stories: newStories
      };

    case 'CommentsLoaded':
      let newComments = [...state.comments];
      newComments.push(...payload);
      return {
        ...state,
        comments: newComments
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

export function showChildrenAction(comment: Item, show: boolean): ActionType {
  return {
    type: 'ShowChildren',
    payload: {
      comment: comment,
      show: show
    }
  };
}

export function showTopStoriesAction(): ActionType {
  return {
    type: 'ShowTopStories',
    payload: undefined
  };
}

export function showCommentsAction(story: Item): ActionType {
  return {
    type: 'ShowComments',
    payload: story
  };
}

export function storiesLoadedAction(stories: Item[]): ActionType {
  console.log({ storiesLoadedAction: stories });
  return {
    type: 'StoriesLoaded',
    payload: stories
  };
}

export function commentsLoadedAction(comments: Item[]): ActionType {
  console.log({ commentsLoadedAction: comments });
  return {
    type: 'CommentsLoaded',
    payload: comments
  };
}

const showTopStoriesEpic: Epic<Action, State> = action$ =>
  action$
    .ofType('ShowTopStories')
    .map(i => {
      console.log('ShowTopStories emitted');
      return i;
    })
    .mergeMap(getTopStories$)
    .map(storiesLoadedAction);

const showCommentsEpic: Epic<ActionType, State> = action$ =>
  action$
    .ofType('ShowComments')
    .map(i => {
      console.log('ShowComments emitted');
      return i;
    })
    .mergeMap(action => getCommentsForStory$(action.payload.kids))
    .map(commentsLoadedAction);

/* Some stuff */
const asyncMiddleware = createEpicMiddleware(
  combineEpics(showTopStoriesEpic, showCommentsEpic)
);

export const store = createStore(reducer, applyMiddleware(asyncMiddleware));
