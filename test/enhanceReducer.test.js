import { assert } from 'chai';
import { spy } from 'sinon';

import enhanceReducer from '../src/enhanceReducer';
import sideEffect from '../src/sideEffect';

describe('Enhance Reducer', () => {
  it('should throw an exception when root reducer is not a function', () => {
    const enhanced = enhanceReducer(false);

    try {
      enhanced({});
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: Provided root reducer is not a function.');
    }
  });

  it('should return app state and execute side effect with provided arguments', () => {
    const effect = () => {};
    const executor = spy();

    function* rootReducer() {
      yield sideEffect(effect, 42, 'foobar');
      yield sideEffect(effect, 43);
      return 3;
    }

    const enchanced = enhanceReducer(rootReducer, executor);
    const reduction = enchanced({}, {});

    assert.equal(reduction, 3);
    assert.deepEqual(executor.firstCall.args, [
      [
        sideEffect(effect, 42, 'foobar'),
        sideEffect(effect, 43)
      ]
    ]);
  });

  it('should be allowed to yield only sideEffects', () => {
    function* invalidReducer() {
      yield 1;
      yield sideEffect(() => {});
      return 4;
    }

    function* validReducer() {
      yield sideEffect(() => {});
      yield sideEffect(() => {}, 'foo', 'bar');
      return 42;
    }

    try {
      enhanceReducer(invalidReducer, () => {})({}, {});
      assert.isTrue(false);
    } catch (ex) {
      assert.equal(ex.message, 'Invariant violation: Yielded side effects must always be created using sideEffect function');
    }

    assert.equal(enhanceReducer(validReducer, () => {})({}, {}), 42);
  });
});
