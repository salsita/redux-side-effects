import { spy } from 'sinon';
import { assert } from 'chai';

import * as Utils from '../src/utils';

describe('Utils', () => {
  const exceptionMessage = 'mock';
  function* generator() {
    yield 1;
    yield 2;
    return 3;
  }

  it('should throw an exception when invariant condition is not met', () => {
    try {
      spy(Utils, 'invariant');

      Utils.invariant(false, exceptionMessage);
    } catch (ex) {
      assert.match(Utils.invariant.exceptions[0].message, new RegExp(exceptionMessage));
    }
  });

  it('should not throw an exception when invariant condition is met', () => {
    Utils.invariant(true, exceptionMessage);
    assert.isTrue(true);
  });

  it('should return true when isFunction takes function as an argument', () => {
    assert.isTrue(Utils.isFunction(() => {}));
  });

  it('should return false when isFunction does not take function as an argument', () => {
    assert.isFalse(Utils.isFunction(false));
  });

  it('should return true when isUndefined takes undefined as an argument', () => {
    assert.isTrue(Utils.isUndefined(undefined));
  });

  it('should return false when isUndefined does not take undefined as an argument', () => {
    assert.isFalse(Utils.isUndefined(false));
  });

  it('should return true when isIterable takes generator function result as an argument', () => {
    const generatorFunction = function* () {};

    assert.isTrue(Utils.isIterable(generatorFunction()));
  });

  it('should return false when isIterable does not take generator function result as an argument', () => {
    assert.isFalse(Utils.isIterable(false));
  });

  it('should throw an exception when passing an empty array as an argument to `first` function', () => {
    try {
      spy(Utils, 'first');

      Utils.first([]);
    } catch (ex) {
      assert.isTrue(Utils.first.threw());
    }
  });

  it('should throw an exception when passing non array as an argument to `first` function', () => {
    try {
      spy(Utils, 'first');

      Utils.first(false);
    } catch (ex) {
      assert.isTrue(Utils.first.threw());
    }
  });

  it('should call the mapper function as many times as there are elements in the iterable', () => {
    const mapper = spy(() => {});

    Utils.mapIterable(generator(), mapper);

    assert.equal(mapper.callCount, 3);
  });

  it('should return the mapped array', () => {
    const mapper = val => val + 1;

    const mapped = Utils.mapIterable(generator(), mapper);

    assert.deepEqual(mapped, [2, 3, 4]);
  });
});
