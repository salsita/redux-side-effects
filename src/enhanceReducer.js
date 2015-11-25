import AppStateWithEffects from './AppStateWithEffects';
import {
  isFunction,
  isUndefined,
  isIterable,
  invariant,
  first,
  mapIterable
} from './utils';

/**
 * AppStateOrEffect mapper - maps Iterable to AppStateOrEffect data structure.
 * The last element in Iterable chain is Application State the rest are some side effect.
 *
 * @param {any} Side effect Function or Application State any
 *
 * @param {Boolean} Last element in iterable
 * @returns {Object} AppStateOrEffect - Object containing isEffect(Boolean) and value(Function|Any)
 */
const mapIterableToEffectsAndAppState = (value, last) => ({
  isEffect: !last,
  value
});

/**
 * AppStateOrEffect mapper - extracts just the value.
 *
 * @param {Object} Either Application State or Effect
 * @returns {any} Might be either Function (for Effect) or any for Application State
 */
const mapValue = appStateOrEffect => appStateOrEffect.value;

/**
 * Predicate function - decides whether appStateOrEffect is an Effect.
 *
 * @param {Object} Either Application State or Effect
 * @returns {Boolean}
 */
const effectsPredicate = appStateOrEffect => appStateOrEffect.isEffect;

/**
 * Predicate function - decides whether appStateOrEffect is an Application State.
 *
 * @param {Object} Either Application State or Effect
 * @returns {Boolean}
 */
const appStatePredicate = appStateOrEffect => !appStateOrEffect.isEffect;

/**
 * Reducer enhancer. Iterates over generator like reducer reduction and accumulates
 * all the side effects and reduced application state.
 *
 * @param {Function} Root reducer in form of generator function
 * @returns {Function} Reducer which returns AppStateWithEffects instead of simple Application state
 */
export default rootReducer => (stateWithEffects, action) => {
  invariant(isFunction(rootReducer),
    `Provided root reducer is not a function.`);

  // Calling the Root reducer should return an Iterable
  const reduction = rootReducer(stateWithEffects.getAppState(), action);

  if (isIterable(reduction)) {
    // Iterable returned by Root reducer is mapped into array of values.
    // Last value in the array is reduced application state all the other values
    // are just side effects.
    const appStateAndEffects = mapIterable(reduction, mapIterableToEffectsAndAppState);

    // It's necessary to separate array of effects and Application state from flat array
    const effects = appStateAndEffects.filter(effectsPredicate).map(mapValue);
    const appState = appStateAndEffects.filter(appStatePredicate).map(mapValue);

    invariant(!isUndefined(first(appState)),
      `Root reducer does not return new application state. Undefined is returned`);

    return new AppStateWithEffects(first(appState), effects);
  } else {
    console.warn(
      'createEffectCapableStore enhancer from redux-side-effects package is used, ' +
      'yet the provided root reducer is not a generator function'
    );

    return new AppStateWithEffects(reduction, []);
  }
};
