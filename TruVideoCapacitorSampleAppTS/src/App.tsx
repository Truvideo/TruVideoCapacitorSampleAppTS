import { IonRouterOutlet } from '@ionic/react';
import { Route } from 'react-router-dom';

import HomeComponent from './components/HomeComponent';
import VideoComponent from './components/VideoComponent';
import MediaComponent from './components/MediaComponent';
import ImageComponent from './components/ImageComponent';

import { ToastContainer } from 'react-toastify';
import VideoDownload from './components/VideoDownload';
import VideoRequestScreen from './components/VideoRequestScreen';

function App() {
  return (
    <>
      <IonRouterOutlet>
        <Route exact path="/" component={HomeComponent} />
        <Route exact path="/media" component={MediaComponent} />
        <Route exact path="/image" component={ImageComponent} />
        <Route exact path="/video" component={VideoComponent} />
        <Route exact path="/videoDownload" component={VideoDownload} />
        <Route exact path="/videoRequest" component={VideoRequestScreen} />
      </IonRouterOutlet>
      <ToastContainer />
    </>
  );
}

export default App;
