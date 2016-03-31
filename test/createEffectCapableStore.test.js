import { assert } from 'chai';
import { stub, spy } from 'sinon';
import { createStore, compose } from 'redux';

import sideEffect from '../src/sideEffect';
import createEffectCapableStore from '../src/createEffectCapableStore';

describe('Create effect capable store', () => {

  it('should execute all the effects in next call stack', done => {
    const effect = spy();

    function* reducer() {
      yield sideEffect(effect, 42, 'foobar');
      yield sideEffect(effect);
      return 1;
    }

    const storeFactory = createEffectCapableStore(createStore);
    const store = storeFactory(reducer);

    assert.isFalse(effect.called);

    setTimeout(() => {
      assert.equal(effect.callCount, 2);
      assert.deepEqual(effect.firstCall.args, [store.dispatch, 42, 'foobar']);
      assert.deepEqual(effect.secondCall.args, [store.dispatch]);
      done();
    });
  });


  it('should allow to yield effect within action which has been dispatched through effect', done => {
    const effect = spy();

    function* reducer(appState = 1, action) {
      if (action.type === 'first') {
        yield sideEffect(dispatch => dispatch({ type: 'second' }));
      } else if (action.type === 'second') {
        yield sideEffect(effect, 42);
      }

      return appState;
    }

    const storeFactory = createEffectCapableStore(createStore);
    const store = storeFactory(reducer);
    store.dispatch({ type: 'first' });

    assert.isFalse(effect.called);

    setTimeout(() => {
      setTimeout(() => {
        assert.equal(effect.callCount, 1);
        assert.deepEqual(effect.firstCall.args, [store.dispatch, 42]);
        done();
      });
    });
  });

  it('should wrap the next reducer even when the replaceReducer is called', done => {
    const effect = spy();
    function* testingReducer(appState, action) {
      if (action.type === 'foo') {
        yield sideEffect(effect, 42);
      }
      return 1;
    }

    const testingStore = createEffectCapableStore(createStore)(testingReducer);
    testingStore.replaceReducer(testingReducer);
    testingStore.dispatch({ type: 'foo' });

    setTimeout(() => {
      assert.equal(effect.callCount, 1);
      assert.deepEqual(effect.firstCall.args, [testingStore.dispatch, 42]);
      done();
    });
  });

  it('should ignore side effects when any action is dispatched while reducer is being replaced', done => {
    const effect = spy();
    function* testingReducer(appState, action) {
      if (action.type === '@@redux/INIT') {
        yield sideEffect(effect, 42);
      }
      return 1;
    }

    const testingStore = createEffectCapableStore(createStore)(testingReducer);
    testingStore.replaceReducer(testingReducer);

    setTimeout(() => {
      assert.equal(effect.callCount, 1);
      assert.deepEqual(effect.firstCall.args, [testingStore.dispatch, 42]);
      done();
    });
  });
});
