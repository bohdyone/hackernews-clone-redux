import { Observable } from 'rxjs';

// const BUFFER_INTERVAL = 500;
const CONCURRENCY_LIMIT = 15;
const ajax = Observable.ajax;

export function getTopStories$(): Observable<IndexedItem[]> {
  return getTopStoryIds$().mergeMap(getListOfItem$);
  // .scan(arrayReducer, []);
}

export function getCommentsForItem$(item: Item, depth: number) {
  return getListOfItem$(item.kids || [], item.id, depth + 1);
}

// function arrayReducer<T>(acc: T[], val: T) {
//   console.log({ arrayReducer: acc });
//   acc.push(val);
//   // let newArr = [...acc];
//   // newArr.push(val);
//   return acc;
// }

export function getListOfItem$(
  ids: number[],
  parentId?: number,
  depth: number = 0
): Observable<IndexedItem[]> {
  let pipe = Observable.from(
    ids.map((id, index): IndexedId => ({
      id: id,
      index: index,
      parentId: parentId,
      depth: depth
    }))
  )
    .take(100)
    .map(getItemWithIndex$)
    .mergeAll(CONCURRENCY_LIMIT)
    .bufferTime(500);
  // .bufferCount(500);
  // .map(i => [i]);
  // .pipe(combineLatest(ids=>ids.map(getItem$)), concatMap(i=>i))
  // .concatMap(ids => Observable.forkJoin(ids.map(getItemWithIndex$)));
  // .concatMap()
  // .combineLatest()
  // .concatMap()
  // .bufferTime(BUFFER_INTERVAL);

  return pipe;

  // return Observable.forkJoin(pipe);
}

// .take(1)
// .mergeMap(getItem$)
// .bufferTime(BUFFER_INTERVAL) // control concurrent requests

// return Observable.from(ids).bufferCount(10)
//   // .bufferTime(BUFFER_INTERVAL, 0, 10)
//   .map(idList => idList.map(getItem$)).mergeAll();

export interface Item {
  id: number;
  kids?: number[];
  text: string;
  by: string;
}

export type IndexedItem = {
  index: number;
  item: Item;
  depth?: number;
  parentId?: number;
};

type IndexedId = {
  index: number;
  id: number;
  depth: number;
  parentId?: number;
};

// export type IndexedDepthItem = IndexedItem & {
//   depth: number;
// };

function getItemWithIndex$({
  index,
  parentId,
  depth,
  id
}: IndexedId): Observable<IndexedItem> {
  console.log({ getItem: id });
  let item$ = getItem$(id) as Observable<Item>;
  return item$.map(item => ({
    index: index,
    item: item,
    depth: depth,
    parentId: parentId
  }));
}

function getItem$(id: number): Observable<Item> {
  console.log({ getItem: id });
  const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
  return ajax.getJSON(url);
}

export function getTopStoryIds$(): Observable<number[]> {
  const url = 'https://hacker-news.firebaseio.com/v0/topstories.json';

  return ajax.getJSON(url);
}

// function fetchExtraItemsByIds(ids, setter) {
//   const CHUNK_SIZE = 10;
//   ids = _.take(ids, 200);
//   const chunks = _.chunk(ids, CHUNK_SIZE);

//   for (let chunk of chunks) {
//     // console.log(chunk);
//     // this.queueChunk(chunk, setter);
//     this.processChunk({
//       chunk: chunk,
//       setter: setter
//     })
//   }
// }
