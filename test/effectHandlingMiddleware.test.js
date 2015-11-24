import { assert } from 'chai';
import { stub, spy } from 'sinon';

import effectHandlingMiddleware from '../src/effectHandlingMiddleware';
import AppStateWithEffects from '../src/AppStateWithEffects';

const stubReduction = 'stub';

describe('EffectHandlingMiddleware', () => {
  let stubStore;

  beforeEach(() => {
    stubStore = {
      dispatch: () => {},
      getState: () => {}
    };
  });

  it('should return original reduction if reducer does not return AppStateWithEffects', () => {
    const dispatchResult = effectHandlingMiddleware(stubStore)(() => stubReduction)(null);
    assert.equal(dispatchResult, stubReduction);
  });

  it('should call the effect with dispatch provided when specified in AppStateWithEffects', () => {
    const firstSideEffect = spy(() => {});
    const secondSideEffect = spy(() => {});

    stub(stubStore, 'getState').returns(new AppStateWithEffects({}, [firstSideEffect, secondSideEffect]));
    effectHandlingMiddleware(stubStore)(() => stubReduction)(null);

    assert.isTrue(firstSideEffect.calledWith(stubStore.dispatch));
    assert.isTrue(secondSideEffect.calledWith(stubStore.dispatch));
  });

  it('shoul throw an exception when any of effect is not function', () => {
    const firstSideEffect = spy(() => {});
    stub(stubStore, 'getState').returns(new AppStateWithEffects({}, [firstSideEffect, true]));

    try {
      effectHandlingMiddleware(stubStore)(() => stubReduction)(null);
    } catch (ex) {
      assert.equal(ex.message, `Invariant violation: It's allowed to yield only functions (side effect)`);
    }
  });
});
