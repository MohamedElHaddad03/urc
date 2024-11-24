import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import * as serviceWorkerRegistration from './service-worker-registration.js';
import {Client} from '@pusher/push-notifications-web';  

const root = ReactDOM.createRoot(document.getElementById('root'));

const beamsClient = new Client({
  instanceId: '240dc048-764d-4e06-b419-98c933b6b851',  
});

beamsClient.start()
  .then(() => beamsClient.addDeviceInterest('chat'))  
  .then(() => console.log('Successfully registered and subscribed!'))
  .catch(console.error);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();

reportWebVitals(console.log);
