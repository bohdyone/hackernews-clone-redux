async function getItem(id: any) {
  const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
