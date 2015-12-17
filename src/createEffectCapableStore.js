import { isDevelopmentEnvironment, isPlainObject } from './utils';
import Task from './Task';
import createEnhanceReducer from './createEnhanceReducer';

/**
 * Creates enhanced store factory, which takes original `createStore` as argument.
 * The store's `dispatch` and `getState` methods are wrapped with custom implementation.
 *
 * @param {Function} Original createStore implementation to be enhanced
 * @returns {Function} Store factory
 */
export default createStore => (rootReducer, initialState) => {
  // Reference to the store dispatch function.
  let dispatch;
  let cleaningEffects = false;
  let warnedPlainAction = false;
  let warnedEffectEffects = false;

  const cleanTask = new Task();
  const effectQueue = [];

  /**
   * Takes all of the effects in the closure effect queue, dispatches them,
   * captures their values and empties the queue.
   *
   * @private
   * @returns {Array<any>} The return values of dispatch.
   */

  const cleanEffectQueue = () => {
    cleaningEffects = true;
    const values = effectQueue.map(dispatch);
    effectQueue.length = 0; // @see https://davidwalsh.name/empty-array
    cleaningEffects = false;
    return values;
  };

  /**
   * Defers an effect to be dispatched by `cleanEffectQueue` later. Does this by
   * adding the effect to an internal queue and deferring the `cleanEffectQueue`
   * function if no other task is set.
   *
   * @private
   * @param {any} The effect action to be dispatched later.
   */

  const deferEffect = effect => {
    if (isDevelopmentEnvironment()) {
      if (!warnedPlainAction && isPlainObject(effect)) {
        warnedPlainAction = true;
        console.warn(
          'redux-side-effects: ' +
          'Yeilding a plain object generally means you are cascading actions, ' +
          'this is a banned practice (http://stackoverflow.com/questions/29309214). ' +
          'Try to use thunks instead.'
        );
      }

      if (!warnedEffectEffects && cleaningEffects) {
        warnedEffectEffects = true;
        console.warn(
          'redux-side-effects: ' +
          'It is generally a bad practice for side effects to have side effects. ' +
          'Instead try to dispatch all side effects at once.'
        );
      }
    }

    effectQueue.push(effect);

    if (!cleanTask.isSet()) {
      cleanTask.defer(cleanEffectQueue);
    }
  };

  /**
   * Dispatches all side effects now instead of later. This allows a user to use
   * `Promise.all` or other await mechanisms for server side data prefetching.
   * Simply a store alias for `cleanEffectQueue`.
   *
   * @see cleanEffectQueue
   */

  const dispatchEffects = cleanEffectQueue;

  // Create the reducer enhancer.
  const enhanceReducer = createEnhanceReducer(deferEffect);

  // Create the store and set the `dispatch` reference to the store dispatch method.
  const store = createStore(enhanceReducer(rootReducer), initialState);
  dispatch = store.dispatch;

  return {
    ...store,
    dispatchEffects,
    replaceReducer: nextReducer => store.replaceReducer(enhanceReducer(nextReducer)) // TODO: This could be a good usecase for a compose function?
  };
};
