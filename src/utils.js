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
