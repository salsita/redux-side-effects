redux-side-effects
=============

[![NPM version][npm-image]][npm-url]
[![Dependencies][dependencies]][npm-url]
[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]


> What if your reducers were generators? You could yield side effects and return application state.

Believe it or not, but side effects are still tied with your application's domain. Ideally, you would be able to keep them in reducers. But wait! Everybody is saying that reducers must be pure! So yeah, just keep the reducer pure and reduce side effects as well.

## Why?

Some people (I am one of them) believe that [Elm](https://github.com/evancz/elm-architecture-tutorial/#example-5-random-gif-viewer) has found the proper way how to handle side effects. Yes, we have a solution for async code in [redux](https://github.com/rackt/redux) and it's [`redux-thunk`](https://github.com/gaearon/redux-thunk) but the solution has two major drawbacks:

1) Application logic is not in one place, which leads to the state where business domain may be encapsulated by service domain.

2) Unit testing of some use cases which heavy relies on side effect is nearly impossible. Yes, you can always test those things in isolation but then you will lose the context. It's breaking the logic apart, which is making it basically impossible to test as single unit.

Therefore ideal solution is to keep the domain logic where it belongs (reducers) and abstract away execution of side effects. Which means that your reducers will still be pure (Yes! Also hot-reloadable and easily testable). There are basically two options, either we can abuse reducer's reduction (which is basically a form of I/O Monad) or we can simply put a bit more syntactic sugar on it.

Because ES6 [generators](https://developer.mozilla.org/cs/docs/Web/JavaScript/Reference/Statements/function*) is an excellent way how to perform lazy evaluation, it's also a perfect tool for the syntax sugar to simplify working with side effects.

Just imagine, you can `yield` a side effect and framework runtime is responsible for executing it after `reducer` reduces new application state. This ensures that Reducer remains pure.

```javascript
import { sideEffect } from 'redux-side-effects';

const loggingEffect = (dispatch, messaage) => console.log(message);

function* reducer(appState = 1, action) {
  yield sideEffect(loggingEffect, 'This is side effect');

  return appState + 1;
}
```

The function is technically pure because it does not execute any side effects and given the same arguments the result is still the same.

## Usage

API of this library is fairly simple, the only possible functions are `createEffectCapableStore` and `sideEffect`. `createEffectCapableStore` is a store enhancer which enables us to use Reducers in form of Generators. `sideEffect` returns declarative Side effect and allows us easy testing. In order to use it in your application you need to import it, keep in mind that it's [named import](http://www.2ality.com/2014/09/es6-modules-final.html#named_exports_%28several_per_module%29) therefore following construct is correct:

`import { createEffectCapableStore } from 'redux-side-effects'`

The function is responsible for creating Redux store factory. It takes just one argument which is original Redux [`createStore`](http://redux.js.org/docs/api/createStore.html) function. Of course you can provide your own enhanced implementation of `createStore` factory.

To create the store it's possible to do the following:

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
import { createEffectCapableStore, sideEffect } from 'redux-side-effects';

import * as API from './API';

const storeFactory = createEffectCapableStore(createStore);

const addTodoEffect = (dispatch, todo) => API.addTodo(todo).then(() => dispatch({type: 'TODO_ADDED'}));

const store = storeFactory(function*(appState = {todos: [], loading: false}, action) {
  if (action.type === 'ADD_TODO') {
    yield sideEffect(addTodoEffect, action.payload);

    return {...appState, todos: [...appState.todos, action.payload], loading: true};
  } else if (action.type === 'TODO_ADDED') {
    return {...appState, loading: false};
  } else {
    return appState;
  }
});

render(<Application store={store} />, document.getElementById('app-container'));

```

## Declarative Side Effects

The `sideEffect` function is just a very simple declarative way how to express any Side Effect. Basically you can only `yield` result of the function and the function must be called with at least one argument which is Side Effect execution implementation function, all the additional arguments will be passed as arguments to your Side Effect execution implementation function.

```javascript
const effectImplementation = (dispatch, arg1, arg2, arg3) => {
  // Your Side Effect implementation
};


yield sideEffect(effectImplementation, 'arg1', 'arg2', 'arg3'....);
```

Be aware that first argument provided to Side Effect implementation function is always `dispatch` so that you can `dispatch` new actions within Side Effect.

## Unit testing

Unit Testing with `redux-side-effects` is a breeze. You just need to assert iterable which is result of Reducer.

```javascript
function* reducer(appState) {
  if (appState === 42) {
    yield sideEffect(fooEffect, 'arg1');

    return 1;
  } else {
    return 0;
  }
}

// Now we can effectively assert whether app state is correctly mutated and side effect is yielded.
it('should yield fooEffect with arg1 when condition is met', () => {
  const iterable = reducer(42);

  assert.deepEqual(iterable.next(), {
    done: false,
    value: sideEffect(fooEffect, 'arg1')
  });
  assert.equal(iterable.next(), {
    done: true,
    value: 1
  });
})

```


## Example

There's very simple fully working example including unit tests inside `example` folder.

You can check it out by:
```
cd example
npm install
npm start
open http://localhost:3000
```

Or you can run tests by
```
cd example
npm install
npm test
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

If you are using standard Redux [`combineReducer`](http://rackt.org/redux/docs/api/combineReducers.html) in your application, please use the imported version from this package, original implementation does not work with generators. However, keep in mind that this method is [opinionated](http://rackt.org/redux/docs/api/combineReducers.html#notes) and therefore you should probably provide your own implementation.

Usage is simple:

`import { combineReducers } from 'redux-side-effects'`


[npm-image]: https://img.shields.io/npm/v/redux-side-effects.svg?style=flat-square
[npm-url]: https://npmjs.org/package/redux-side-effects
[travis-image]: https://img.shields.io/travis/salsita/redux-side-effects.svg?style=flat-square
[travis-url]: https://travis-ci.org/salsita/redux-side-effects
[downloads-image]: http://img.shields.io/npm/dm/redux-side-effects.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/redux-side-effects
[dependencies]: https://david-dm.org/salsita/redux-side-effects.svg
