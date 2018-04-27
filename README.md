# My Hacker News Clone

## Goals

To learn more about effective Redux and async request handling patterns.

## Design Considerations

The official public Hacker News API presents an interesting problem. Unusually low-level for a web API, it gives us an interface to fetch lists of items (stories or comments) and then retrieve each item by id with a separate request, with no native capability to batch these requests. I notice that most other HN clones use alternative APIs that abstract this unexpected complexity. However, I found it a compelling use-case to test a few different approaches to modeling the problem. The design considerations here include:

* Fetching the top stories list may retrieve 500 item ids. We probably won't look at all these, so it's wasteful to fetch the content for all of them on every load.

  * **Problem:** Not all items need to be loaded up-front.
  * **Solution:** Use IntersectionObserver API to load only the viewed items on demand.

* Regardless of the above optimisation, user may scroll rapidly or there may be other cases where we need to load a large array of items concurrently (e.g. loading comments).

  * **Problem:** Fetching a large amount of requests concurrently may overwhelm the browser, producing lag and CPU spikes.
  * **Solution:** Batch the loading of items to a maximum level of concurrency. 15 was chosen as a ball-park measure and produces good results on my machine. Though a static window may be used here to simplify implementation, this would mean waiting on the slowest request in the batch before processing the results. Instead item requests are dispatched independently up to the maximum level of concurrency, so when one clears another can take its place.
  * **Problem:** Give individual item may be loaded at any time and added to application state, this can produce an overwhelming amount of render/dom diff calls, again producing lag for the user.
  * **Solution:** Batch up render calls into windows. Considering that any amout of items may arrive and yet we still want to render them as soon as practical, waiting till a buffer fills is no appropriate. Instead we use a timer to to clear (render) the buffer of loaded items at regular intervals, say 500ms. Furthermore, I've taken care to apply keys to each rendered item, and eliminate the need to re-render them when the content hasn't changed.

* Given that items are loaded individually, they may not arrive sequentially, and yet they still need to be rendered sequentially.

  * **Problem:** Items need to be ordered on arrival.
  * **Solution:** Items are tagged with an order index when the request is made, which is preserved to the response. To minimise time to visible content, items are show in order of arrival, where preceding items may still appear later when loading is complete. In the stories list, this is shown to the user visually by displaying the whole top item list by index and loading indicators for each item.

* Comments for a story are presented as a recusive data structure, where the children of each item need to be loaded from a list of ids, and so-on proceeding downwards recursively.

  * **Problem:** Loading the complete list of comments for a story may mean many hundreds of network requests.
  * **Solution:** As per the above efficient request pipeline, comments to an arbitrary level of nesting may be loaded without overwhelming the browser. However, to minimise network bandwidth and load, as well as readability, only the first level is preloaded by default, with the expand link showing the number of comments one further level down. This pre-load depth is trivial to change by configuration.

* The list of comments or stories for each view is no-longer relevant when changing views.
  * **Problem:** Any oustanding requests for a given view should be terminated when changing views.
  * **Solution:** Though any loading requests are allowed to finish, the buffer of queued requests is cleared when chaniging views.

## History

I started out with the aim of using `redux-observable` and RXJS to manage the complexity of meeting my design goals, but ultimately found it too complicated to achieve what I wanted to do. Though adding type annotations to each stage in the pipeline helped a lot, I stuggled with much hardship to represent the centralised fetch and update batching as transformations of streams. Abandoning this approach, and switching to the simpler and somewhat more imperative style of `redux-saga` made the pain go away. `redux-saga`s "Channels" provide a much simpler and yet still powerful stream abstraction.

## Trying it out

Simplest way is to clone the project and then run `npm start` or `yarn start`.
