import { assert } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import createEffectCapableStore from '../src/createEffectCapableStore';

const testAction = { type: 'test' };

describe('Create effect capable store', () => {
  it('enhances a generator function reducer', () => {
    function* testingReducer() {
      yield testAction;
      return 1;
    }

    const testingStore = createEffectCapableStore(createStore)(testingReducer);
    testingStore.dispatch(testAction);
    assert.equal(testingStore.getState(), 1);
  });

  it('will dispatch a yielded action later asynchronously', done => {
    function* testingReducer(state, { type }) {
      yield { type: 'b' };
      return type === 'a' ? 1 : 2;
    }

    const testingStore = createEffectCapableStore(createStore)(testingReducer);
    testingStore.dispatch({ type: 'a' });
    assert.equal(testingStore.getState(), 1);

    setTimeout(() => {
      assert.equal(testingStore.getState(), 2);
      done();
    }, 0);
  });

  it('will work with applied middleware', done => {
    function* testingReducer(state, { type }) {
      yield dispatch => dispatch({ type: 'b' });
      return type === 'a' ? 1 : 2;
    }

    const testingStore = createEffectCapableStore(applyMiddleware(thunk)(createStore))(testingReducer);
    testingStore.dispatch({ type: 'a' });
    assert.equal(testingStore.getState(), 1);

    setTimeout(() => {
      assert.equal(testingStore.getState(), 2);
      done();
    }, 0);
  });

  it('can dispatch effects synchronously and return results', () => {
    function* testingReducer(state, { type }) {
      if (type === 'a') {
        yield { type: 'b' };
        yield () => 42;
        return 1;
      }
      return 2;
    }

    const testingStore = createEffectCapableStore(applyMiddleware(thunk)(createStore))(testingReducer);
    testingStore.dispatch({ type: 'a' });
    const effects = testingStore.dispatchEffects();
    assert.equal(testingStore.getState(), 2);
    assert.deepEqual(effects, [{ type: 'b' }, 42]);
  });

  it('should wrap the next reducer even when the replaceReducer is called', () => {
    function* testingReducer() {
      yield testAction;
      return 1;
    }

    const testingStore = applyMiddleware(thunk)(createEffectCapableStore(createStore))(testingReducer);
    testingStore.dispatch(testAction);
    assert.equal(testingStore.getState(), 1);
    testingStore.replaceReducer(testingReducer);
    assert.equal(testingStore.getState(), 1);
  });
});
