import { applyMiddleware, createStore } from 'redux';
import { Item, IndexedItem, IndexedItemDef } from './Data';
import createSagaMiddleware from 'redux-saga';
import { watchFetchItems, watchItemLoaded, rootSaga } from './Sagas';

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

export type ShowChildrenAction = {
  type: 'ITEM_CHILDREN_SHOW';
  payload: {
    item: Item;
    depth: number;
    show: boolean;
  };
};

type ShowTopStories = {
  type: 'TOP_STORIES_SHOW';
  payload: undefined;
};

export type ShowCommentsAction = {
  type: 'SHOW_STORY_COMMENTS';
  payload: Item;
};

type CommentsLoaded = {
  type: 'CommentsLoaded';
  payload: IndexedItem[];
};
type StoriesLoaded = {
  type: 'STORIES_LOADED';
  payload: IndexedItem[];
};

export type ItemLoadedAction = {
  type: 'ITEM_LOADED';
  payload: IndexedItem;
};

export type LoadItemsAction = {
  type: 'LOAD_ITEMS';
  payload: IndexedItemDef[];
};

export type ViewChangedAction = {
  type: 'VIEW_CHANGED';
  payload: ViewType;
};

type Action =
  | ShowChildrenAction
  | ShowTopStories
  | ShowCommentsAction
  | CommentsLoaded
  | StoriesLoaded
  | LoadItemsAction
  | ItemLoadedAction;

export function reducer(state: State, action: Action): State {
  // an error about the return type means you missed a case
  // const payload = action.payload;

  if (state === undefined) return initState;

  switch (action.type) {
    case 'TOP_STORIES_SHOW':
      // load stories
      return {
        ...state,
        show: 'topStories',
        stories: [],
        selectedStory: null
      };

    case 'SHOW_STORY_COMMENTS':
      // load comments

      return {
        ...state,
        show: 'comments',
        selectedStory: action.payload
        // commentsExpanded: {},
        // comments: []
      };

    case 'STORIES_LOADED': {
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
    case 'ITEM_CHILDREN_SHOW': {
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
    case 'ITEM_LOADED': {
      // handled in saga
      return state;
    }
    case 'LOAD_ITEMS': {
      return state;
    }
  }
}
export function itemLoadedAction(item: IndexedItem): ItemLoadedAction {
  return {
    type: 'ITEM_LOADED',
    payload: item
  };
}

export function showChildrenAction(
  indexed: IndexedItem,
  show: boolean
): ShowChildrenAction {
  console.log({ showChildrenAction: indexed });
  return {
    type: 'ITEM_CHILDREN_SHOW',
    payload: {
      item: indexed.item,
      depth: indexed.depth || 0,
      show: show
    }
  };
}

export function showTopStoriesAction(): ShowTopStories {
  return {
    type: 'TOP_STORIES_SHOW',
    payload: undefined
  };
}

export function showCommentsAction(story: Item): ShowCommentsAction {
  return {
    type: 'SHOW_STORY_COMMENTS',
    payload: story
  };
}

export function storiesLoadedAction(stories: IndexedItem[]): StoriesLoaded {
  console.log({ storiesLoadedAction: stories });
  return {
    type: 'STORIES_LOADED',
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

export function loadItemsAction(items: IndexedItemDef[]): LoadItemsAction {
  return {
    type: 'LOAD_ITEMS',
    payload: items
  };
}

// const showTopStoriesEpic: Epic<Action, State> = action$ =>
//   action$
//     // .switch(action$.filter(a=>a.t))
//     .ofType('ShowTopStories')
//     .map(i => {
//       console.log('ShowTopStories emitted');
//       return i;
//     })
//     .mergeMap(getTopStories$)
//     // .takeUntil(action$.ofType('ShowComments')) // cancel stories load when switching to comments
//     .map(storiesLoadedAction);

const sagaMiddleware = createSagaMiddleware();
export const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchFetchItems);
sagaMiddleware.run(watchItemLoaded);
sagaMiddleware.run(rootSaga);
