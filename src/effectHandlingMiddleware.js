import AppStateWithEffects from './AppStateWithEffects';
import { isFunction, invariant } from './utils';

/**
 * Redux standard middleware. The middleware is responsible for pulling the AppStateWithEffects
 * off the Store.getState result. If the state is instance of AppStateWithEffects all the
 * effects (Functions) gets executed and dispatch is provided as the argument.
 *
 * @returns {Function} Redux standard middleware
 */
export default store => next => action => {
  const result = next(action);

  const storeState = store.getState();
  if (storeState instanceof AppStateWithEffects) {
    const effects = storeState.getEffects();

    invariant(effects.every(isFunction),
      `It's allowed to yield only functions (side effect)`);

    // Side effect is just an yielded Function which receives dispatch as the first argument.
    effects.forEach(effect => effect(store.dispatch));
  }

  return result;
};
