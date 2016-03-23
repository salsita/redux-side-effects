import { assert } from 'chai';

import enhanceReducer from '../src/enhanceReducer';

describe('Enhance Reducer', () => {
  it('should throw an exception when root reducer is not a function', () => {
    const enhanced = enhanceReducer(false);

    try {
      enhanced(new AppStateWithEffects());
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: Provided root reducer is not a function.');
    }
  });

  it('should return AppStateWithEffects even when root reducer is not a generator', () => {
    const rootReducer = () => {};
    const enhanced = enhanceReducer(rootReducer);
    const reduction = enhanced(new AppStateWithEffects());

    assert.isTrue(reduction instanceof AppStateWithEffects);
  });

  it('should return AppStateWithEffects with returned reduction and List of effects', () => {
    function* rootReducer() {
      yield 1;
      yield 2;
      return 3;
    }

    const enchanced = enhanceReducer(rootReducer);
    const reduction = enchanced(new AppStateWithEffects());

    assert.equal(reduction.getAppState(), 3);
    assert.deepEqual(reduction.getEffects(), [1, 2]);
  });
});
