/**
 * Simple invariant check.
 *
 * @param {Boolean} A condition to be met
 *
 * @param {String} An exception message to be thrown
 * @returns {void}
 */
export const invariant = (condition, message) => {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
};

/**
 * Checks whether provided argument is a function.
 *
 * @param {any} Anything
 *
 * @returns {Boolean} Result of function check
 */
export const isFunction = any => typeof any === 'function';

/**
 * Checks whether provided argument is undefined.
 *
 * @param {any} Anything
 *
 * @returns {Boolean} Result of undefined check
 */
export const isUndefined = any => typeof any === 'undefined';

/**
 * Checks whether provided argument is iterable. The value must be defined and
 * must contain function named next.
 *
 * @param {any} Anything
 *
 * @returns {Boolean} Result of iterable check
 */
export const isIterable = value => !isUndefined(value) && isFunction(value.next);

/**
 * Checks whether provided argument is generator.
 *
 * @param {any} Anything
 *
 * @returns {Boolean} Result of generator check
 */
export const isGenerator = fn => {
  const Generator = (function*() {}).constructor;

  return fn instanceof Generator;
};

/**
 * Map implementation which takes iterable as an argument.
 *
 * @param {Iterable}
 *
 * @param {Function}
 * @returns {Array} Array mapped by mapper function
 */
export const mapIterable = (iterable, mapper) => {
  invariant(isIterable(iterable),
    `First argument passed to mapIterable must be iterable`);

  invariant(isFunction(mapper),
    `Second argument passed to mapIterable must be a function`);

  // Clojure like recur loop
  // It's not ideal to use for..of as it does not
  // return the last value in iteration loop
  const recur = acc => {
    const next = iterable.next();
    acc.push(mapper(next.value, next.done));

    // ES6 tail call
    return next.done ? acc : recur(acc);
  };

  return recur([]);
};

/**
 * Returns first element in a non-empty array;
 *
 * @param {Array}
 * @returns {any} First element in the provided Array
 */
export const first = arr => {
  invariant(Array.isArray(arr),
    `Provided argument is not array`);

  invariant(arr.length > 0,
    `Provided array is empty`);

  return arr[0];
};

/**
 * Standard map implementation which works with type of Object
 *
 * @param {Object} Object to be mapped
 *
 * @param {Function} Mapper function
 * @returns {Object} Mapped object
 */
export const mapObject = (object, fn) =>
  Object.keys(object).reduce((memo, key) => {
    memo[key] = fn(object[key], key);

    return memo;
  }, {});

/**
 * Standard map implementation which works with type of Object
 * and mapper in form of generator
 *
 * @param {Object} Object to be mapped
 *
 * @param {Function} Mapper function
 * @returns {Object} Mapped object
 */
export const generatorMapObject = function*(object, generatorFn) {
  invariant(isGenerator(generatorFn),
    `First argument passed to filterGeneratorYieldedValues must be generator`);

  const keys = Object.keys(object);

  function* recur(memo, index) {
    memo[keys[index]] = yield* generatorFn(object[keys[index]], keys[index]);
    return keys[index + 1] ? yield* recur(memo, index + 1) : memo;
  }

  return yield* recur({}, 0);
};

/**
 * Returns all the yield value within generator.
 *
 * @param {Object} Iterable created of generator
 *
 * @returns {Array} Array of yielded values
 */
export const filterGeneratorYieldedValues = iterable => {
  invariant(isIterable(iterable),
    `First argument passed to getGeneratorReturnValue must be an iterable`);

  const recur = acc => {
    const next = iterable.next();
    if (next.done) {
      return acc;
    } else {
      acc.push(next.value);

      return recur(acc);
    }
  };

  return recur([]);
};

/**
 * Returns the returned value withing generator
 *
 * @param {Object} Iterable created of generator
 *
 * @returns {any} Value returned in generator
 */
export const getGeneratorReturnValue = iterable => {
  invariant(isIterable(iterable),
    `First argument passed to getGeneratorReturnValue must be generator`);

  const recur = () => {
    const next = iterable.next();
    return next.done ? next.value : recur();
  };

  return recur();
};
