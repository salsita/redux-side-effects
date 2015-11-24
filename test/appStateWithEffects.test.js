import { assert } from 'chai';

import AppStateWithEffects from '../src/AppStateWithEffects';

describe('AppStateWithEffects', () => {
  it('should return application state', () => {
    const appState = 'mock';
    const effects = [];

    const appStateWithEffects = new AppStateWithEffects(appState, effects);
    assert.equal(appStateWithEffects.getAppState(), appState);
  });

  it('should return effects', () => {
    const appState = 'mock';
    const effects = [];

    const appStateWithEffects = new AppStateWithEffects(appState, effects);
    assert.equal(appStateWithEffects.getEffects(), effects);
  });
});
