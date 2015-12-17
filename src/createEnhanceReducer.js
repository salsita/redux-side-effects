import {
  isFunction,
  isUndefined,
  isIterable,
  invariant,
  mapIterable
} from './utils';

/**
 * AppStateOrEffect mapper - extracts just the value.
 *
 * @param {Object} The generator iteration object
 * @returns {any} Might be either Function (for Effect) or any for Application State
 */
const mapValue = iteration => iteration.value;

/**
 * Creates a reducer enhancer which iterates over generator-like reducer reduction and
 * dispatches all the side effects while returning application state.
 *
 * @param {Function} A dispatch function which is deffered to after call stack completion.
 * @returns {Function} A reducer enhancer which takes the old reducer and returns a new one.
 */

export default function createEnhanceReducer(defferedDispatch) {
  return rootReducer => (state, action) => {
    invariant(isFunction(rootReducer),
      `Provided root reducer is not a function.`);

    // Calling the Root reducer should return an Iterable
    const reduction = rootReducer(state, action);

    if (isIterable(reduction)) {
      // Iterable returned by Root reducer is mapped into array of values.
      // Last value in the array is reduced application state all the other values
      // are just side effects.
      const effects = mapIterable(reduction, mapValue);
      const newState = effects.pop();

      // Dispatch each effect later.
      effects.forEach(defferedDispatch);

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
}
