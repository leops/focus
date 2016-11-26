import React from 'react';
import ReactDOM from 'react-dom';
import {
    Provider,
} from 'react-redux';

import App from './app';
import store from './store';
import initMenu from './menu';
import './index.global.css';

initMenu(store);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);
