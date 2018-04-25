import {
  call,
  fork,
  put,
  take,
  flush,
  takeLatest,
  select
} from 'redux-saga/effects';
import * as Api from './Api';
import { channel, delay, Channel, buffers } from 'redux-saga';
import {
  itemLoadedAction,
  LoadItemsAction,
  ItemLoadedAction,
  commentsLoadedAction,
  storiesLoadedAction,
  loadItemsAction,
  ShowCommentsAction,
  ShowChildrenAction,
  State,
  showChildrenAction
  // itemLoadingSetAction
} from './Update';
import { IndexedItem, ItemType, Item } from './Data';
import * as _ from 'lodash';

const ITEM_CONCURRENCY_LIMIT = 15;
const FLUSH_TIMER = 500;
const INTIAL_LOAD_DEPTH = 1;

function* fetchItem(itemDef: IndexedItem) {
  try {
    let item = yield call(Api.fetchItem, itemDef.id);
    yield put(
      itemLoadedAction({
        id: item.id,
        item: item,
        index: itemDef.index,
        parentId: itemDef.parentId,
        depth: itemDef.depth,
        type: itemDef.type
      })
    );
  } catch (e) {
    console.log(e);
  }
}

function* fetchTopStories() {
  let stories = yield call(Api.getTopStories);
  let indexedItems = stories.map(
    (id, index) =>
      <IndexedItem>{
        id: id,
        index: index,
        type: 'story'
      }
  );
  // yield put(loadItemsAction(indexedItems));
  yield put(storiesLoadedAction(indexedItems));
}

function* watchFetchItem(chan: Channel<IndexedItem>) {
  while (true) {
    const itemDef = yield take(chan);
    yield call(fetchItem, itemDef);
  }
}

function* watchStopFetching(chan: Channel<IndexedItem>) {
  while (true) {
    yield take(['STORIES_TOP_SHOW', 'STORY_COMMENTS_SHOW']);
    // drop buffered items
    yield flush(chan);
  }
}

export function* watchFetchItems() {
  const itemChannel: Channel<IndexedItem> = yield call(
    channel,
    buffers.expanding()
  );

  for (let i = 0; i < ITEM_CONCURRENCY_LIMIT; i++) {
    yield fork(watchFetchItem, itemChannel);
  }

  yield fork(watchStopFetching, itemChannel);

  while (true) {
    let { payload }: LoadItemsAction = yield take('ITEMS_LOAD');
    for (let itemDef of payload) {
      let existing = false;
      // check for items already loaded
      if (itemDef.type == 'comment') {
        let commentsLoaded: IndexedItem[] = yield select(
          (state: State) => state.comments
        );
        existing =
          commentsLoaded.findIndex(
            i => (i.item || { id: 0 }).id == itemDef.id
          ) > -1;
      }
      if (!existing) {
        // yield put(itemLoadingSetAction(itemDef, true));
        yield put(itemChannel, itemDef);
      }
    }
  }
}

function* watchItemsLoaded(chan) {
  while (true) {
    // flush at regular intervals
    yield delay(FLUSH_TIMER);
    let items: IndexedItem[] = yield flush(chan);

    if (items && items.length) {
      console.log({ watchItemsLoaded: items });
      // split by type and raise corresponding actions
      let partitioned = _.groupBy(items, 'type');
      let comments = partitioned[<ItemType>'comment'] || [];
      let stories = partitioned[<ItemType>'story'] || [];
      // yield all(items.map(i => itemLoadingSetAction(i, false)));
      if (comments.length) yield put(commentsLoadedAction(comments));
      if (stories.length) yield put(storiesLoadedAction(stories));
    }
  }
}

export function* watchItemLoaded() {
  const itemsLoadedChannel: Channel<IndexedItem> = yield call(
    channel,
    buffers.expanding()
  );
  yield fork(watchItemsLoaded, itemsLoadedChannel);

  while (true) {
    let { payload }: ItemLoadedAction = yield take('ITEM_LOADED');
    yield put(itemsLoadedChannel, payload);
    // load subcomments recursively
    if (
      payload.type == 'comment' &&
      (payload.depth || 0) <= INTIAL_LOAD_DEPTH
    ) {
      yield put(showChildrenAction(<Item>payload.item, payload.depth, true));
    }
  }
}

export function* showComments(action: ShowCommentsAction) {
  yield loadChildren(action.payload);
}

function* loadChildren(item: Item, depth = 0, isStory = false) {
  let commentIds = item.kids || [];
  let items = commentIds.map(
    (id, index) =>
      <IndexedItem>{
        id: id,
        index: index,
        parentId: item.id,
        depth: depth + 1,
        type: 'comment'
      }
  );

  yield put(loadItemsAction(items));
}

function* showChildren(action: ShowChildrenAction) {
  yield loadChildren(action.payload.item, action.payload.depth);
}

export function* rootSaga() {
  yield takeLatest('STORIES_TOP_SHOW', fetchTopStories);
  yield takeLatest('STORY_COMMENTS_SHOW', showComments);
  yield takeLatest('ITEM_CHILDREN_SHOW', showChildren);
}
