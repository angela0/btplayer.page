import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Info from './info/Info';
import Login from './login/Login';
import Player from './player/Player';
import Search from './search/Search';
import { createBrowserHistory } from 'history';
import {
  Router,
  Route,
} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

const customHistory = createBrowserHistory();

ReactDOM.render(
    <Router history={customHistory}>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/search" component={Search} />
      <Route path="/info" component={Info} />
      <Route path="/player" component={Player} />
    </div>
    </Router>,
    document.getElementById('root'));
registerServiceWorker();
