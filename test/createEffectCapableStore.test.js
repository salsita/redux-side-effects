import { assert } from 'chai';
import { stub, spy } from 'sinon';

import AppStateWithEffects from '../src/AppStateWithEffects';
import { wrapGetState, wrapDispatch } from '../src/createEffectCapableStore';

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
    assert.isTrue(effect1.calledWith(store.dispatch));
    assert.isTrue(effect2.calledWith(store.dispatch));
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
});
