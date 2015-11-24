import { assert } from 'chai';

import effectCapableReducerEnhancer from '../src/effectCapableReducerEnhancer';

describe('effectCapableReducerEnhancer', () => {
  it('should throw an exception when root reducer is not a function', () => {
    const enhanced = effectCapableReducerEnhancer(false);

    try {
      enhanced();
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: Provided root reducer is not a function.');
    }
  });

  it('should throw an exception when root reducer is not generator', () => {
    const rootReducer = () => {};
    const enhanced = effectCapableReducerEnhancer(rootReducer);

    try {
      enhanced();
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: Root reducer must be an iterable function and therefore return Iterable');
    }
  });

  it('should return AppStateWithEffects with returned reduction and List of effects', () => {
    function* rootReducer() {
      yield 1;
      yield 2;
      return 3;
    }

    const enchanced = effectCapableReducerEnhancer(rootReducer);
    const reduction = enchanced();

    assert.equal(reduction.getAppState(), 3);
    assert.deepEqual(reduction.getEffects(), [1, 2]);
  });
});
