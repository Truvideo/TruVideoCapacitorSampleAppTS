import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IonApp>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </IonApp>
  </StrictMode>,
)
