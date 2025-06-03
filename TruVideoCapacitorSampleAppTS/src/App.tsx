import HomeComponent from './components/HomeComponent';
import { IonRouterOutlet } from '@ionic/react';
import { Route } from 'react-router-dom';
import VideoComponent from './components/VideoComponent';
import { ToastContainer } from 'react-toastify';
import MediaComponent from './components/MediaComponent';
import ImageComponent from './components/ImageComponent';

function App() {
  return (
    <>
      <IonRouterOutlet>
        <Route exact path="/" component={HomeComponent} />
        <Route exact path="/media" component={MediaComponent} />
        <Route exact path="/image" component={ImageComponent} />
        <Route exact path="/video" component={VideoComponent} />
      </IonRouterOutlet>
      <ToastContainer />
    </>
  );
}

export default App;
