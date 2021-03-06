import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CheckOrEdit from './pages/CheckOrEdit';

// import LoginScreen from './pages/LoginScreen';

import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <CheckOrEdit />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
