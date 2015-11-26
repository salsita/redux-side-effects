import { assert } from 'chai';

import combineReducers from '../src/combineReducers';
import { getGeneratorReturnValue, filterGeneratorYieldedValues } from '../src/utils';

describe('Combine Reducers', () => {
  it('should return a composition reducer which returns reduction mapping all the reducers reduction by their keys', () => {
    const foo = function*(appState = 0) {
      return appState + 1;
    };
    const bar = function*(appState = 0) {
      return appState + 2;
    };

    const combinedReducer = combineReducers({foo, bar});
    const reduction = getGeneratorReturnValue(combinedReducer(undefined, undefined));

    assert.equal(reduction.foo, getGeneratorReturnValue(foo()));
    assert.equal(reduction.bar, getGeneratorReturnValue(bar()));
    assert.notEqual(reduction.foo, getGeneratorReturnValue(bar()));
    assert.notEqual(reduction.bar, getGeneratorReturnValue(foo()));
  });

  it('should propagate all the yielded values when using combineReducers', () => {
    const foo = function*(appState = 0) {
      yield 1;
      yield 2;
      return appState + 1;
    };
    const bar = function*(appState = 0) {
      yield 3;
      return appState + 1;
    };

    const combinedReducer = combineReducers({foo, bar});

    const yieldedValues = filterGeneratorYieldedValues(combinedReducer(undefined, undefined));
    const reduction = getGeneratorReturnValue(combinedReducer(undefined, undefined));

    assert.deepEqual(yieldedValues, [1, 2, 3]);
    assert.equal(reduction.foo, getGeneratorReturnValue(foo()));
    assert.equal(reduction.bar, getGeneratorReturnValue(bar()));
  });

  it('should allow to pass either generators or standard functions as reducers', () => {
    const foo = function*(appState = 0) {
      return appState + 1;
    };
    const bar = (appState = 0) => appState + 2;

    const combinedReducer = combineReducers({foo, bar});
    const reduction = getGeneratorReturnValue(combinedReducer(undefined, undefined));

    assert.equal(reduction.foo, getGeneratorReturnValue(foo()));
    assert.equal(reduction.bar, bar());
    assert.notEqual(reduction.foo, bar());
    assert.notEqual(reduction.bar, getGeneratorReturnValue(foo()));
  });
});
