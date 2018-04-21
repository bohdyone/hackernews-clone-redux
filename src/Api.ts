import { Item } from './Data';

export async function fetchItem(id: number): Promise<Item> {
  const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

export async function getTopStories(): Promise<number[]> {
  const url = 'https://hacker-news.firebaseio.com/v0/topstories.json';

  let response = await fetch(url);
  let storyIds = await response.json();
  return storyIds;
}

export async function getNewStories(): Promise<number[]> {
  const url = 'https://hacker-news.firebaseio.com/v0/newstories.json';

  let response = await fetch(url);
  let storyIds = await response.json();
  return storyIds;
}

export async function getBestStories(): Promise<number[]> {
  const url = 'https://hacker-news.firebaseio.com/v0/beststories.json';

  let response = await fetch(url);
  let storyIds = await response.json();
  return storyIds;
}
