# redux-side-effects

> What if your reducers were generators? You could yield side effects and return application state.

Believe it or not, but side effects are still tied with your application's domain. Ideally, you would be able to keep them in reducers. But wait! Everybody is saying that reducers must be pure! So yeah, just keep the reducer pure and reduce side effects as well.

## Why?

## Usage

API of this library is fairly simple, the only possible function is `createEffectCapableStore`. In order to use it in your application you need to import it, keep in mind that it's named import therefore following construct is correct:

`import { createEffectCapableStore } from 'redux-side-effects'`

The function is responsible for creating Redux store factory. It takes just one argument which is original Redux [`createStore`](http://redux.js.org/docs/api/createStore.html) function. Of course you can provide your own enhanced implementation of `createStore` factory.

To create the store it's possible do following:

```javascript
import { createStore } from 'redux';
import { createEffectCapableStore } from 'redux-side-effects';

const reducer = appState => appState;

const storeFactory = createEffectCapableStore(createStore);
const store = storeFactory(reducer);

```

Basically something like this should be fully functional:

```javascript
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { createEffectCapableStore } from 'redux-side-effects';

import * as API from './API';

const storeFactory = createEffectCapableStore(createStore);

const store = storeFactory(function*(appState = {todos: [], loading: false}, action) {
  if (action.type === 'ADD_TODO') {
    yield dispatch => API.addTodo(action.payload).then(() => dispatch({type: 'TODO_ADDED'}))

    return {...appState, todos: [...appState.todos, action.payload], loading: true};
  } else if (action.type === 'TODO_ADDED') {
    return {...appState, loading: false};
  } else {
    return appState;
  }
});

render(<Application store={store} />, document.getElementById('app-container'));

```

## Contribution

In case you are interested in contribution, feel free to send a PR. Keep in mind that any created issue is much appreciated. For local development:

```
  npm install
  npm run test:watch
```

You can also `npm link` the repo to your local Redux application so that it's possible to test the expected behaviour in real Redux application.

Please for any PR, don't forget to write unit test.

## Need Help?

You can reach me on [reactiflux](http://www.reactiflux.com) - username tomkis1, or DM me on [twitter](https://twitter.com/tomkisw).

## FAQ

> Does redux-side-effects work with working Redux application?

Yes! I set this as the major condition when started thinking about this library. Therefore the API is completely backwards compatible with any
Redux application.

> My middlewares are not working anymore, what has just happened?

If you are using middlewares you have to use `createEffectCapableStore` for middleware enhanced store factory, not vice versa. Meaning:

```javascript
    const createStoreWithMiddleware = applyMiddleware(test)(createStore);
    const storeFactory = createEffectCapableStore(createStoreWithMiddleware);
    const store = storeFactory(reducer);
```

is correct.

> Can I compose reducers?

Yes! `yield*` can help you with the composition. The concept is explained in this [gist](https://gist.github.com/tomkis1/236f6ba182b48fde4dc9)

> I keep getting warning "createEffectCapableStore enhancer from redux-side-effects package is used yet the provided root reducer is not a generator function", what does that mean?

Keep in mind that your root reducer needs to be generator function therefore this will throw the warning:

```javascript
const storeFactory = createEffectCapableStore(createStore);
const store = storeFactory(function(appState) { return appState; });
```

but this will work:

```javascript
const storeFactory = createEffectCapableStore(createStore);
const store = storeFactory(function* (appState) { return appState; });
```

> Can I use ()* => {} instead of function*()?

Unfortunately no. Only `function*` is valid ES6 syntax.

> I am using combineReducers, how does this work with redux-side-effects?

Coming soon...