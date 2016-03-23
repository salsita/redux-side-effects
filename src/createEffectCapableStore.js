import enhanceReducer from './enhanceReducer';

/**
 * Wraps Store `replaceReducer` method. The implementation just calls
 * the original `replaceReducer` method but the provided next reducer
 * is enhanced.
 *
 * @param {Object} Original Store
 * @returns {Function} Wrapped `replaceReducer`
 */
export const wrapReplaceReducer = (store, deferEffects) => nextReducer =>
  store.replaceReducer(enhanceReducer(nextReducer, deferEffects));

/**
 * Creates enhanced store factory, which takes original `createStore` as argument.
 * Returns modified store which is capable of handling Reducers in form of Generators.
 *
 * @param {Function} Original createStore implementation to be enhanced
 * @returns {Function} Store factory
 */
export default createStore => (rootReducer, initialState) => {
  let store = null;

  const deferEffects = effects =>
    setTimeout(() =>
      effects.forEach(([fn, ...args]) => fn(store.dispatch, ...args)), 0);

  store = createStore(enhanceReducer(rootReducer, deferEffects), initialState);

  return {
    ...store,
    replaceReducer: wrapReplaceReducer(store, deferEffects)
  };
};
