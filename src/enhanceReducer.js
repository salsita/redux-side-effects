import {
  isFunction,
  isUndefined,
  isIterable,
  invariant,
  mapIterable
} from './utils';

import {
  isSideEffect
} from './sideEffect';

/**
 * Iterator mapper, maps iterator to value
 *
 * @param {Object} Iterator
 * @returns {Any} Iterator Value
 */
const mapValue = iterator => iterator.value;

/**
 * Reducer enhancer. Iterates over generator like reducer reduction and accumulates
 * all the side effects and reduced application state.
 *
 * @param {Function} Root reducer in form of generator function
 * @param {Function} Function used for deferring effects accumulated from Reduction
 * @returns {Function} Reducer
 */
export default (rootReducer, deferEffects) => (appState, action) => {
  invariant(isFunction(rootReducer),
    `Provided root reducer is not a function.`);

  // Calling the Root reducer should return an Iterable
  const reduction = rootReducer(appState, action);

  if (isIterable(reduction)) {
    // Iterable returned by Root reducer is mapped into array of values.
    // Last value in the array is reduced application state all the other values
    // are just side effects.
    const effects = mapIterable(reduction, mapValue);
    const newState = effects.pop();

    invariant(effects.every(isSideEffect),
      'Yielded side effects must always be created using sideEffect function');

    deferEffects(effects);

    invariant(!isUndefined(newState),
      `Root reducer does not return new application state. Undefined is returned`);

    return newState;
  } else {
    console.warn(
      'createEffectCapableStore enhancer from redux-side-effects package is used, ' +
      'yet the provided root reducer is not a generator function'
    );

    return reduction;
  }
};
