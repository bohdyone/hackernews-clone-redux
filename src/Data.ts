import { Observable } from 'rxjs';

// const BUFFER_INTERVAL  = 1000;
const CONCURRENCY_LIMIT = 15;
const ajax = Observable.ajax;

export function getTopStories$(): Observable<Item[]> {
  return getTopStoryIds$().mergeMap(getListOfItem$);
  // .scan(arrayReducer, []);
}

// function arrayReducer<T>(acc: T[], val: T) {
//   console.log({ arrayReducer: acc });
//   acc.push(val);
//   // let newArr = [...acc];
//   // newArr.push(val);
//   return acc;
// }

export function getListOfItem$(ids: number[]): Observable<Item[]> {
  let pipe = Observable.from(ids)
    // .take(55)
    .bufferCount(CONCURRENCY_LIMIT)
    .concatMap(ids => Observable.forkJoin(ids.map(getItem$)));
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
