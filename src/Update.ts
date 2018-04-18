import { applyMiddleware, createStore } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { getTopStories$, Item, getCommentsForItem$, IndexedItem } from './Data';

export type ViewType = 'topStories' | 'comments';

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
  stories: IndexedItem[];
  comments: IndexedItem[];
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

type ShowChildren = {
  type: 'ShowChildren';
  payload: {
    item: Item;
    depth: number;
    show: boolean;
  };
};

type ShowTopStories = {
  type: 'ShowTopStories';
  payload: undefined;
};

type ShowComments = {
  type: 'ShowComments';
  payload: Item;
};

type CommentsLoaded = {
  type: 'CommentsLoaded';
  payload: IndexedItem[];
};
type StoriesLoaded = {
  type: 'StoriesLoaded';
  payload: IndexedItem[];
};

type Action =
  | ShowChildren
  | ShowTopStories
  | ShowComments
  | CommentsLoaded
  | StoriesLoaded;

export function reducer(state: State, action: Action): State {
  // an error about the return type means you missed a case
  // const payload = action.payload;

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
        selectedStory: action.payload,
        storyCommentCache: {},
        commentsExpanded: {},
        comments: []
      };

    case 'StoriesLoaded': {
      let payload = action.payload;
      let newStories = [...state.stories];
      newStories.push(...payload);
      return {
        ...state,
        stories: newStories
      };
    }

    case 'CommentsLoaded': {
      let payload = action.payload;
      let newComments = [...state.comments];
      newComments.push(...payload);
      return {
        ...state,
        comments: newComments
      };
    }
    case 'ShowChildren': {
      let payload = action.payload;
      let show = payload.show;
      console.log({ ShowChildren: payload });

      let commentsExpanded = { ...state.commentsExpanded };
      if (show) {
        commentsExpanded[payload.item.id] = true;
        // load payload.comment.kids
        // store into comment cache
      } else {
        delete commentsExpanded[payload.item.id];
      }

      return {
        ...state,
        commentsExpanded: commentsExpanded
      };
    }
  }
}

export function showChildrenAction(
  indexed: IndexedItem,
  show: boolean
): ShowChildren {
  console.log({ showChildrenAction: indexed });
  return {
    type: 'ShowChildren',
    payload: {
      item: indexed.item,
      depth: indexed.depth || 0,
      show: show
    }
  };
}

export function showTopStoriesAction(): ShowTopStories {
  return {
    type: 'ShowTopStories',
    payload: undefined
  };
}

export function showCommentsAction(story: Item): ShowComments {
  return {
    type: 'ShowComments',
    payload: story
  };
}

export function storiesLoadedAction(stories: IndexedItem[]): StoriesLoaded {
  console.log({ storiesLoadedAction: stories });
  return {
    type: 'StoriesLoaded',
    payload: stories
  };
}

export function commentsLoadedAction(comments: IndexedItem[]): CommentsLoaded {
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
    .takeUntil(action$.ofType('ShowComments')) // cancel stories load when switching to comments
    .map(storiesLoadedAction);

const showCommentsEpic: Epic<Action, State, any> = action$ =>
  action$
    .ofType('ShowComments')
    .map(i => {
      console.log('ShowComments emitted');
      return i;
    })
    .mergeMap((action: ShowComments) => getCommentsForItem$(action.payload, 0))
    .map(commentsLoadedAction);

const showChildrenEpic: Epic<Action, State> = action$ =>
  action$
    .ofType('ShowChildren')
    .map(i => {
      console.log('ShowChildren emitted');
      return i;
    })
    .mergeMap((action: ShowChildren) =>
      getCommentsForItem$(action.payload.item, action.payload.depth)
    )
    .map(commentsLoadedAction);

/* Some stuff */
const asyncMiddleware = createEpicMiddleware(
  combineEpics(showTopStoriesEpic, showCommentsEpic, showChildrenEpic)
);

export const store = createStore(reducer, applyMiddleware(asyncMiddleware));
