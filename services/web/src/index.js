import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './containers/App';

const router = (
  <BrowserRouter>
    <Route component={App} />
  </BrowserRouter>
)

ReactDOM.render(
  router,
  document.getElementById('root')
)
