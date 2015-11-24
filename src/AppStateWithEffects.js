/**
 * Just a type class for wrapping Application State and Array of Sidef Effects.
 *
 * @class AppStateWithEffects
 */
export default class AppStateWithEffects {

  /**
   * @param {any} Application State
   * @param {Array} Array of side effects (Functions)
   */
  constructor(appState, effects) {
    this.appState = appState;
    this.effects = effects;
  }

  /**
   * @returns {any} Application State
   */
  getAppState() {
    return this.appState;
  }

  /**
   * @returns {Array} Array of side effects (Functions)
   */
  getEffects() {
    return this.effects;
  }
}
