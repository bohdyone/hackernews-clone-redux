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
  State
} from './Update';
import { IndexedItemDef, IndexedItem, ItemType, Item } from './Data';
import * as _ from 'lodash';

const ITEM_CONCURRENCY_LIMIT = 15;
const FLUSH_TIMER = 500;

function* fetchItem(itemDef: IndexedItemDef) {
  let item = yield call(Api.fetchItem, itemDef.id);
  yield put(
    itemLoadedAction({
      item: item,
      index: itemDef.index,
      parentId: itemDef.parentId,
      type: itemDef.type
    })
  );
}

function* fetchTopStories() {
  let stories = yield call(Api.getTopStories);
  let indexedItems = stories.map(
    (id, index) =>
      <IndexedItemDef>{
        id: id,
        index: index,
        type: 'story'
      }
  );
  yield put(loadItemsAction(indexedItems));
}

function* watchFetchItem(chan: Channel<IndexedItemDef>) {
  while (true) {
    const itemDef = yield take(chan);
    yield call(fetchItem, itemDef);
  }
}

function* watchStopFetching(chan: Channel<IndexedItemDef>) {
  while (true) {
    yield take(['TOP_STORIES_SHOW', 'SHOW_STORY_COMMENTS']);
    // drop buffered items
    yield flush(chan);
  }
}

export function* watchFetchItems() {
  const itemChannel: Channel<IndexedItemDef> = yield call(
    channel,
    buffers.expanding()
  );

  for (let i = 0; i < ITEM_CONCURRENCY_LIMIT; i++) {
    yield fork(watchFetchItem, itemChannel);
  }

  yield fork(watchStopFetching, itemChannel);

  while (true) {
    let { payload }: LoadItemsAction = yield take('LOAD_ITEMS');
    for (let itemDef of payload) {
      let existing = false;
      // check for items already loaded
      if (itemDef.type == 'comment') {
        let commentsLoaded: IndexedItem[] = yield select(
          (state: State) => state.comments
        );
        existing = commentsLoaded.findIndex(i => i.item.id == itemDef.id) > -1;
      }
      if (!existing) yield put(itemChannel, itemDef);
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
  }
}

export function* showComments(action: ShowCommentsAction) {
  yield loadChildren(action.payload);
}

function* loadChildren(item: Item, isStory = false) {
  let commentIds = item.kids || [];
  let items = commentIds.map(
    (id, index) =>
      <IndexedItemDef>{
        id: id,
        index: index,
        parentId: item.id,
        type: 'comment'
      }
  );

  yield put(loadItemsAction(items));
}

function* showChildren(action: ShowChildrenAction) {
  yield loadChildren(action.payload.item);
}

export function* rootSaga() {
  yield takeLatest('TOP_STORIES_SHOW', fetchTopStories);
  yield takeLatest('SHOW_STORY_COMMENTS', showComments);
  yield takeLatest('ITEM_CHILDREN_SHOW', showChildren);
}
