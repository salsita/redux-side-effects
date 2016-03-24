import { assert } from 'chai';
import { sideEffect } from 'redux-side-effects';

import reducer, { loadGifEffect } from '../src/reducer';

describe('reducer test', () => {
  it('should set loading flag and yield side effect to load gif with specific topic after clicking the button', () => {
    const initialAppState = reducer(undefined, { type: 'init' }).next().value;
    const iterable = reducer(initialAppState, { type: 'LOAD_GIF' });

    assert.deepEqual(iterable.next(), {
      done: false,
      value: sideEffect(loadGifEffect, 'funny cats')
    });
    assert.deepEqual(iterable.next(), {
      done: true,
      value: {
        gifUrl: null,
        loading: true,
        topic: 'funny cats'
      }
    });
  });

  it('should reset the loading flag and set appropriate GIF url when GIF is loaded', () => {
    const iterable = reducer({
      gifUrl: null,
      loading: true,
      topic: 'funny cats'
    }, { type: 'NEW_GIF', payload: 'newurl' });

    assert.deepEqual(iterable.next(), {
      done: true,
      value: {
        gifUrl: 'newurl',
        loading: false,
        topic: 'funny cats'
      }
    });
  });
});