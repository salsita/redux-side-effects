import request from 'superagent-bluebird-promise';
import { sideEffect } from 'redux-side-effects';

export const loadGifEffect = (dispatch, topic) => {
  request(`http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${topic}`)
    .then(response => dispatch({ type: 'NEW_GIF', payload: response.body.data.image_url }));
};

const initialAppState = {
  gifUrl: null,
  loading: false,
  topic: 'funny cats'
};

export default function* (appState = initialAppState, action) {
  switch (action.type) {
    case 'CHANGE_TOPIC':
      return {
        ...appState,
        topic: action.payload
      };

    case 'LOAD_GIF':
      yield sideEffect(loadGifEffect, appState.topic);

      return {
        ...appState,
        loading: true
      };

    case 'NEW_GIF':
      return {
        ...appState,
        loading: false,
        gifUrl: action.payload
      };
    default:
      return appState;
  }
};
