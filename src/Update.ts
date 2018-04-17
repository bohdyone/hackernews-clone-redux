import { applyMiddleware, createStore } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { getTopStories$, Item } from './Data';

type ViewType = 'topStories' | 'comments';

interface Story {
  story: any;
  comments: any[];
}

export interface State {
  show: ViewType;
  selectedStory: Story | null;
  commentsExpanded: { [key: number]: boolean };
  storyCommentCache: ItemLookup;
  storyCache: ItemLookup;
  stories: any[];
}

type ItemLookup = {
  [key: number]: any;
};

const initState: State = {
  show: 'topStories',
  selectedStory: null,
  commentsExpanded: {},
  storyCommentCache: {},
  storyCache: {},
  stories: []
};

// type ShowTopStories = {
//   type: 'ShowTopStories';
// };

type ActionTypes =
  | 'ShowTopStories'
  | 'ShowComments'
  // | 'StoryListLoaded'
  | 'StoriesLoaded'
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

    // case 'StoryListLoaded':
    //   return {
    //     ...state,
    //     stories: payload
    //   };

    case 'ShowComments':
      // load comments
      return {
        ...state,
        show: 'comments',
        storyCommentCache: {},
        commentsExpanded: {}
      };

    case 'StoriesLoaded':
      let newStories = [...state.stories];
      newStories.push(...payload);
      return {
        ...state,
        stories: newStories
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

export function showTopStoriesAction(): ActionType {
  return {
    type: 'ShowTopStories',
    payload: undefined
  };
}

export function storiesLoadedAction(stories: Item[]): ActionType {
  console.log({ storiesLoadedAction: stories });
  return {
    type: 'StoriesLoaded',
    payload: stories
  };
}

// function storyListLoadedAction(storyIdList: number[]): ActionType {
//   return {
//     type: 'StoryListLoaded',
//     payload: storyIdList
//   };
// }

// const getStoriesEpic = action$ =>
//   action$
//     .ofType('StoryListLoaded')
//     .map(a => loadItem$(a.payload))
//     .map(storiesLoadedAction);

const showTopStoriesEpic: Epic<Action, State> = action$ =>
  action$
    .ofType('ShowTopStories')
    .map(i => {
      console.log('ShowTopStories emitted');
      return i;
    })
    .mergeMap(getTopStories$)
    .map(storiesLoadedAction);

const asyncMiddleware = createEpicMiddleware(combineEpics(showTopStoriesEpic));

export const store = createStore(reducer, applyMiddleware(asyncMiddleware));
