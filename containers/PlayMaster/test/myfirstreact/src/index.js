import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
const myelement = (
  <table>
    <tr>
      <th>Name</th>
    </tr>
    <tr>
      <td>John</td>
    </tr>
    <tr>
      <td>Elsa</td>
    </tr>
  </table>
);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
