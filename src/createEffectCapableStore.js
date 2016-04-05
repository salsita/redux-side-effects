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
  let dispatching = false;
  let wrappedDispatch = null;

  const deferEffects = effects => {
    if (dispatching) {
      setTimeout(() =>
        effects.forEach(([fn, ...args]) => fn(wrappedDispatch, ...args)), 0);
    }
  };

  // it is expected that createStore will do one dispatch before we wrap it
  dispatching = true;
  store = createStore(enhanceReducer(rootReducer, deferEffects), initialState);
  dispatching = false;

  wrappedDispatch = (...args) => {
    dispatching = true;
    const result = store.dispatch(...args);
    dispatching = false;
    return result;
  };

  return {
    ...store,
    dispatch: wrappedDispatch,
    replaceReducer: nextReducer => {
      store.replaceReducer(enhanceReducer(nextReducer, deferEffects));
    }
  };
};
