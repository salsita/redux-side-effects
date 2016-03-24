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


  it('should call the mapper function as many times as there are elements in the iterable', () => {
    const mapper = spy(() => {});

    Utils.mapIterable(generator(), mapper);

    assert.equal(mapper.callCount, 3);
  });

  it('should return the mapped array', () => {
    const mapper = val => val.value + 1;

    const mapped = Utils.mapIterable(generator(), mapper);

    assert.deepEqual(mapped, [2, 3, 4]);
  });

  it('should return true if generator is provided', () => {
    assert.isTrue(Utils.isGenerator(function*() {}));
  });

  it('should return false if generator is not provided', () => {
    assert.isFalse(Utils.isGenerator(() => {}));
  });

  it('should use the mapper to map over the object', () => {
    const map = {
      'foo': 0,
      'bar': 1
    };

    const mapped = Utils.mapObject(map, (value, key) => `${key}${value + 1}`);
    assert.deepEqual(mapped, {
      'foo': 'foo1',
      'bar': 'bar2'
    });
  });

  it('should use the generator mapper to map over object and yield values', () => {
    const map = {
      'foo': 0,
      'bar': 1
    };

    function* generatorMapper(value, key) {
      yield key + value;
      return value + 1;
    }

    assert.deepEqual({'foo': 1, 'bar': 2}, Utils.getGeneratorReturnValue(Utils.generatorMapObject(map, generatorMapper)));
    assert.deepEqual(['foo0', 'bar1'], Utils.filterGeneratorYieldedValues(Utils.generatorMapObject(map, generatorMapper)));
  });

  it('should filter in yielded values', () => {
    assert.deepEqual(Utils.filterGeneratorYieldedValues(generator()), [1, 2]);
  });

  it('should return returned value withing generator', () => {
    assert.equal(Utils.getGeneratorReturnValue(generator()), 3);
  });

  it('should caught any exception thrown by function provided to isGenerator', () => {
    function nonGeneratorWithException() {
      throw new Error('This should be caught');
    }

    assert.isFalse(Utils.isGenerator(nonGeneratorWithException));
  });
});
