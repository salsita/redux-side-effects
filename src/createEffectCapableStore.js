import { invariant, isFunction } from './utils';
import enhanceReducer from './enhanceReducer';
import AppStateWithEffects from './AppStateWithEffects';

/**
 * Wraps Store `getState` method. Instead of returning just plain old state,
 * it's assumed that the returned state is instance of `AppStateWithEffects`,
 * therefore it proxies the call to `getAppState`.
 *
 * @param {Object} Original Store
 * @returns {Function} Wrapped `getState`
 */
export const wrapGetState = store => () => {
  const state = store.getState();

  if (state instanceof AppStateWithEffects) {
    return state.getAppState();
  } else {
    return state;
  }
};

/**
 * Wraps Store `dispatch` method. The original `dispatch` is called first, then
 * it iterates over all the effects returned from the `getState` function.
 * Every effect is then executed and dispatch is passed as the first argument.
 *
 * @param {Object} Original Store
 * @returns {Function} Wrapped `dispatch`
 */
export const wrapDispatch = store => action => {
  // Let's just dispatch original action,
  // the original dispatch might actually be
  // enhanced by some middlewares.
  const result = store.dispatch(action);

  const effects = store.getState().getEffects();

  invariant(effects.every(isFunction),
    `It's allowed to yield only functions (side effect)`);

  // Effects are executed after action is dispatched
  const effectPromises = effects.map(effect => {
    const effectResult = effect(wrapDispatch(store));

    // TODO: this should obviously be something like isThenable
    if (!(effectResult instanceof Promise)) {
      return new Promise(resolve => resolve(effectResult));
    } else {
      return effectResult;
    }
  });

  return {
    action: result,
    effectPromises
  };
};

/**
 * Wraps Store `replaceReducer` method. The implementation just calls
 * the original `replaceReducer` method but the provided next reducer
 * is enhanced.
 *
 * @param {Object} Original Store
 * @returns {Function} Wrapped `replaceReducer`
 */
export const wrapReplaceReducer = store => nextReducer =>
  store.replaceReducer(enhanceReducer(nextReducer));

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
  const store = createStore(enhanceReducer(rootReducer), new AppStateWithEffects(initialState, []));

  return {
    ...store,
    dispatch: wrapDispatch(store),
    getState: wrapGetState(store),
    liftGetState: () => store.getState(),
    replaceReducer: wrapReplaceReducer(store)
  };
};
