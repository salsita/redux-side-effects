import { assert } from 'chai';
import { stub, spy } from 'sinon';
import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';

import AppStateWithEffects from '../src/AppStateWithEffects';
import createEffectCapableStore, { wrapGetState, wrapDispatch } from '../src/createEffectCapableStore';

describe('Create effect capable store', () => {
  let store;

  beforeEach(() => {
    store = {
      getState: () => {},
      dispatch: () => {}
    };
  });

  it('should return the original app state when calling wrappedGetState method', () => {
    const appState =  'stub';
    stub(store, 'getState').returns(new AppStateWithEffects(appState, []));

    const wrapped = wrapGetState(store);
    assert.equal(wrapped(), appState);
  });

  it('should execute all the effects which are inside AppStateWithEffects', () => {
    const action = 'stub';
    const effect1 = spy();
    const effect2 = spy();

    spy(store, 'dispatch');
    stub(store, 'getState').returns(new AppStateWithEffects({}, [effect1, effect2]));

    const wrapped = wrapDispatch(store);
    wrapped(action);

    assert.isTrue(store.dispatch.calledWith(action));
  });

  it('should allow to pass only function as effect', () => {
    try {
      stub(store, 'getState').returns(new AppStateWithEffects({}, [false]));
      const wrapped = wrapDispatch(store);
      wrapped();
    } catch (ex) {
      assert.equal(ex.message, `Invariant violation: It's allowed to yield only functions (side effect)`);
    }
  });

  it('should allow to yield effect within action which has been dispatched through effect', () => {
    const effect1 = spy(dispatch => {
      if (effect1.callCount === 1) {
        dispatch();
      }
    });

    stub(store, 'getState').returns(new AppStateWithEffects({}, [effect1]));

    const wrappedDispatch = wrapDispatch(store);
    wrappedDispatch();

    assert.equal(effect1.callCount, 2);
  });

  it('should wrap the next reducer even when the replaceReducer is called', () => {
    function* testingReducer() {
      yield () => 1;
      return 1;
    }

    const testingStore = createEffectCapableStore(createStore)(testingReducer);
    testingStore.dispatch({type: 'test'});
    assert.isTrue(testingStore.liftGetState() instanceof AppStateWithEffects);

    testingStore.replaceReducer(testingReducer);
    assert.isTrue(testingStore.liftGetState() instanceof AppStateWithEffects);
  });

  it('should return all effects as promises to be processed by next middleware in the chain', done => {
    const INITIATE_ASYNC = 'INITIATE_ASYNC';
    const ASYNC_PROCESSED = 'ASYNC_PROCESSED';

    const apiMock = value => new Promise(res => setTimeout(() => res(value + 1), 0));

    const effectResolvingMiddleware = ({ getState }) => next => action => {
      const result = next(action);

      Promise
        .all(result.effectPromises)
        .then(() => {
          assert.equal(getState(), 42);
          done();
        });
    };

    const storeFactory = compose(
      applyMiddleware(effectResolvingMiddleware),
      createEffectCapableStore
    )(createStore);

    const createdStore = storeFactory(function*(appState = 41, {type, payload}) {
      switch (type) {
      case INITIATE_ASYNC:
        yield () => console.log('simple non promise side effect');
        yield dispatch => apiMock(appState).then(incrementedAppState => dispatch({type: ASYNC_PROCESSED, payload: incrementedAppState}));
        return appState;

      case ASYNC_PROCESSED:
        return payload;

      default:
        return appState;
      }
    });

    createdStore.dispatch({type: INITIATE_ASYNC});
  });
});
