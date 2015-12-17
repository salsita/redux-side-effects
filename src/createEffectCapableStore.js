import Task from './Task';
import createEnhanceReducer from './createEnhanceReducer';

/**
 * Creates enhanced store factory, which takes original `createStore` as argument.
 * The store's `dispatch` and `getState` methods are wrapped with custom implementation.
 *
 * wrappedDispatch calls the original dispatch and executes all the side effects.
 *
 * wrappedGetState unwraps original applicaiton state from `AppStateWithEffects`
 *
 * @param {Function} Original createStore implementation to be enhanced
 * @returns {Function} Store factory
 */
export default createStore => (rootReducer, initialState) => {
  // Reference to the store dispatch function.
  let dispatch;

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
    const values = effectQueue.map(dispatch);
    effectQueue.length = 0; // @see https://davidwalsh.name/empty-array
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
