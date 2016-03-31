import enhanceReducer from './enhanceReducer';

/**
 * Creates enhanced store factory, which takes original `createStore` as argument.
 * Returns modified store which is capable of handling Reducers in form of Generators.
 *
 * @param {Function} Original createStore implementation to be enhanced
 * @returns {Function} Store factory
 */
export default createStore => (rootReducer, initialState) => {
  let store = null;
  let replacing = false;

  const deferEffects = effects => {
    if (!replacing) {
      setTimeout(() =>
        effects.forEach(([fn, ...args]) => fn(store.dispatch, ...args)), 0);
    }
  };

  store = createStore(enhanceReducer(rootReducer, deferEffects), initialState);

  return {
    ...store,
    replaceReducer: nextReducer => {
      replacing = true;
      store.replaceReducer(enhanceReducer(nextReducer, deferEffects));
      replacing = false;
    }
  };
};
