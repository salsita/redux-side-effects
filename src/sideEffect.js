import {
  isFunction,
  invariant
} from './utils';

/**
 * Creates array describing Side Effect, where first element is Function to be executed and rest are Function arguments
 *
 * @param {Function} Side Effect implementation
 * @param {...args} Side Effect arguments
 *
 * @return {Array} Side Effect Array
 */
export default (fn, ...args) => {
  invariant(
    fn && isFunction(fn),
    'First Side Effect argument is always function'
  );

  return [fn, ...args];
};

/**
 * Checks whether provided argument is Side Effect
 *
 * @param {Any} Anything
 *
 * @return {Bool} Check result
 */
export const isSideEffect = any => Array.isArray(any) && any.length > 0 && isFunction(any[0]);
