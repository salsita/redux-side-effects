import { mapObject, generatorMapObject, isGenerator } from './utils';

/**
 * Port of redux [`combineReducers`](http://rackt.org/redux/docs/api/combineReducers.html). The difference is though
 * that it's allowed to provide reducers as generators. Please, be aware that the function does not contain any
 * special sanity checks. The reason why is that this is quite specific implementation which should most likely
 * be in user land.
 *
 * @param {Map} Map of reducers, key will be used as key in the application state
 * @returns {Function} Single reducer
 */
export default reducers => {
  const initialState = mapObject(reducers, () => undefined);

  return function*(state = initialState, action) {
    let hasChanged;

    const mutatedReduction = yield* generatorMapObject(reducers, function*(reducer, key) {
      const previousKeyedReduction = state[key];

      let nextKeyedReduction;
      if (isGenerator(reducer)) {
        nextKeyedReduction = yield* reducer(previousKeyedReduction, action);
      } else {
        nextKeyedReduction = reducer(previousKeyedReduction, action);
      }

      hasChanged = hasChanged || nextKeyedReduction !== previousKeyedReduction;
      return nextKeyedReduction;
    });

    return hasChanged ? mutatedReduction : state;
  };
};
