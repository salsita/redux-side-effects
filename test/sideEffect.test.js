import { assert } from 'chai';

import sideEffect, { isSideEffect } from '../src/sideEffect';

describe('Side Effect descriptor', () => {
  it('should throw an exception when no arguments are provided', () => {
    try {
      sideEffect();
      assert.isTrue(false);
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: First Side Effect argument is always function');
    }
  });

  it('should return an array where first element is function to be executed', () => {
    const impl = () => {};
    assert.deepEqual(sideEffect(impl), [ impl ]);
  });

  it('should return an array where first element is function to be executed and rest are arguments', () => {
    const impl = () => {};
    const arg1 = 'foobar';
    const arg2 = 42;
    const arg3 = false;

    assert.deepEqual(sideEffect(impl, arg1, arg2, arg3), [impl, arg1, arg2, arg3]);
  });
});

describe('is effect checker', () => {
  it('should return false if anything except array is provided', () => {
    assert.isFalse(isSideEffect(false));
    assert.isFalse(isSideEffect());
    assert.isFalse(isSideEffect(() => {}));
    assert.isFalse(isSideEffect({}));
    assert.isFalse(isSideEffect(new Date()));
    assert.isFalse(isSideEffect(42));
    assert.isFalse(isSideEffect('foobar'));
  });

  it('should return true when array is provided and first argument is function', () => {
    assert.isTrue(isSideEffect(sideEffect(() => {}, 'foo', 'bar')));
  });

  it('should return false when array is provided and first agument is not function', () => {
    assert.isFalse(isSideEffect(['foo', 'bar']));
  });
});
