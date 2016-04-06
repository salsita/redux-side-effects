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
  let executeEffects = false; // Flag to indicate whether it's allowed to execute effects
  let wrappedDispatch = null;

  const callWithEffects = fn => {
    executeEffects = true;
    const result = fn();
    executeEffects = false;
    return result;
  };

  const deferEffects = effects => {
    if (executeEffects) {
      setTimeout(() => {
        if (wrappedDispatch) {
          effects.forEach(([fn, ...args]) => fn(wrappedDispatch, ...args));
        } else {
          // In case anyone tries to do some magic with `setTimeout` while creating store
          console.warn('There\'s been attempt to execute effects yet proper creating of store has not been finished yet');
        }
      }, 0);
    }
  };

  // createStore dispatches @@INIT action and want this action to be dispatched
  // with effects too
  callWithEffects(() => {
    store = createStore(enhanceReducer(rootReducer, deferEffects), initialState);
  });

  // only wrapped dispatch executes effects
  // that ensures that for example devtools do not execute effects while replaying
  wrappedDispatch = (...args) => callWithEffects(() => store.dispatch(...args));

  return {
    ...store,
    dispatch: wrappedDispatch,
    replaceReducer: nextReducer => {
      store.replaceReducer(enhanceReducer(nextReducer, deferEffects));
    }
  };
};
