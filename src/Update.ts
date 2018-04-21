import { applyMiddleware, createStore } from 'redux';
import { Item, IndexedItem } from './Data';
import createSagaMiddleware from 'redux-saga';
import { watchFetchItems, watchItemLoaded, rootSaga } from './Sagas';
import * as _ from 'lodash';

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
  itemsLoading: ItemFlag;
}

export type ItemFlag = { [key: number]: boolean };

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
  comments: [],
  itemsLoading: {}
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
  type: 'STORIES_TOP_SHOW';
  payload: undefined;
};

export type ShowCommentsAction = {
  type: 'STORY_COMMENTS_SHOW';
  payload: Item;
};

type CommentsLoaded = {
  type: 'COMMENTS_LOADED';
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
  type: 'ITEMS_LOAD';
  payload: IndexedItem[];
};

export type ItemLoadingSetAction = {
  type: 'ITEM_LOADING_SET';
  payload: {
    item: IndexedItem;
    loading: boolean;
  };
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
  | ItemLoadedAction
  | ItemLoadingSetAction;

export function reducer(state: State, action: Action): State {
  // an error about the return type means you missed a case
  // const payload = action.payload;

  if (state === undefined) return initState;

  switch (action.type) {
    case 'STORIES_TOP_SHOW':
      // load stories
      return {
        ...state,
        show: 'topStories',
        stories: [],
        selectedStory: null
      };

    case 'STORY_COMMENTS_SHOW':
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
      let newStories = state.stories.map(story => {
        let matching = payload.find(s => s.id == story.id);
        return matching ? matching : story;
      });

      newStories.push(..._.differenceBy(payload, newStories, 'id'));

      return {
        ...state,
        stories: newStories
      };
    }

    case 'COMMENTS_LOADED': {
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
    case 'ITEMS_LOAD': {
      return state;
    }
    case 'ITEM_LOADING_SET': {
      let { item, loading } = action.payload;
      let newState = { ...state.itemsLoading };
      if (loading) newState[item.id] = true;
      else delete newState[item.id];

      return {
        ...state,
        itemsLoading: newState
      };
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
  item: Item,
  depth: number = 0,
  show: boolean
): ShowChildrenAction {
  // console.log({ showChildrenAction: indexed });
  return {
    type: 'ITEM_CHILDREN_SHOW',
    payload: {
      item: item,
      depth: depth,
      show: show
    }
  };
}

export function showTopStoriesAction(): ShowTopStories {
  return {
    type: 'STORIES_TOP_SHOW',
    payload: undefined
  };
}

export function showCommentsAction(story: Item): ShowCommentsAction {
  return {
    type: 'STORY_COMMENTS_SHOW',
    payload: story
  };
}

export function itemLoadingSetAction(
  item: IndexedItem,
  loading: boolean
): ItemLoadingSetAction {
  return {
    type: 'ITEM_LOADING_SET',
    payload: {
      item: item,
      loading: loading
    }
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
    type: 'COMMENTS_LOADED',
    payload: comments
  };
}

export function loadItemsAction(items: IndexedItem[]): LoadItemsAction {
  return {
    type: 'ITEMS_LOAD',
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
