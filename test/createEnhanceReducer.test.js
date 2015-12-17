import { assert } from 'chai';
import { spy } from 'sinon';

import createEnhanceReducer from '../src/createEnhanceReducer';

describe('Enhance Reducer', () => {
  let deferredDispatch;
  let enhanceReducer;

  beforeEach(() => {
    deferredDispatch = spy();
    enhanceReducer = createEnhanceReducer(deferredDispatch);
  });

  it('should throw an exception when root reducer is not a function', () => {
    const enhanced = enhanceReducer(false);

    try {
      enhanced({});
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: Provided root reducer is not a function.');
    }
  });

  it('should return a state object even when root reducer is not a generator', () => {
    const rootReducer = () => ({});
    const enhanced = enhanceReducer(rootReducer);
    const reduction = enhanced({});

    assert.equal(typeof reduction, 'object');
  });

  it('should return the reduced state and dispatch side effects', () => {
    function* rootReducer() {
      yield 1;
      yield 2;
      return 3;
    }

    const enchanced = enhanceReducer(rootReducer);
    const reduction = enchanced({});

    assert.equal(reduction, 3);
    assert.equal(deferredDispatch.callCount, 2);
    assert.isTrue(deferredDispatch.calledWith(1));
    assert.isTrue(deferredDispatch.calledWith(2));
  });
});
