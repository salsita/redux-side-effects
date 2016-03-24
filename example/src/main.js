import React from 'react';
import { render } from 'react-dom';
import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import { createEffectCapableStore } from 'redux-side-effects';

import reducer from './reducer';
import GifViewer from './GifViewer';

const storeFactory = compose(
  createEffectCapableStore,
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

const store = storeFactory(reducer);

render((
  <Provider store={store}>
    <GifViewer />
  </Provider>
), document.getElementById('app'));