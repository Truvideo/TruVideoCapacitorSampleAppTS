import './../css/App.css';
import './../css/home.css';

import { LensFacing, FlashMode, Orientation, CameraMode, initCameraScreen, type CameraConfiguration } from 'truvideo-capacitor-camera-sdk';
import { TruVideoSdkCore } from 'truvideo-capacitor-core-sdk';
import { MediaBuilder, type UploadCompleteEventData, type UploadErrorEvent, type UploadProgressEvent } from 'truvideo-capacitor-media-sdk';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';


type MediaItem = {
  cameraLensFacing: string;
  createdAt: number;
  duration: number;
  filePath: string;
  id: string;
  resolution: {
    height: number;
    width: number;
  };
  rotation: string;
  type: 'VIDEO' | 'PICTURE' | 'IMAGE';
};


function HomeComponent() {

  const [isAuthenticatedLoader, setIsAuthenticatedLoader] = useState<boolean>(false);
  const [authenticationValue, setAuthenticationValue] = useState<string | undefined>(undefined);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  const history = useHistory();



  // Authenticate user and restore previously uploaded media
  useEffect(() => {
    auth();
    const savedImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    const savedVideos = JSON.parse(sessionStorage.getItem('uploadedVideos') || '[]');


    setUploadedImages(savedImages);
    setUploadedVideos(savedVideos);
  }, []);

  async function auth() {
    try {
      setIsAuthenticatedLoader(true);

      const isAuth = await TruVideoSdkCore.isAuthenticated();
      const isAuthExpired = await TruVideoSdkCore.isAuthenticationExpired();

      const payload = await TruVideoSdkCore.generatePayload();
      const pay = String(payload.generatePayload);

      const apiKey = "";
      const secretKey = "";

      const signature = await TruVideoSdkCore.toSha256String({
        secretKey: secretKey,
        payload: pay
      });

      const externalId = "";

      // Authenticate only if not already authenticated or session expired
      if (!isAuth.isAuthenticated || isAuthExpired.isAuthenticationExpired) {
        await TruVideoSdkCore.authenticate({
          apiKey: apiKey,
          payload: pay,
          signature: signature.signature,
          externalId: externalId
        });
      }

      await TruVideoSdkCore.initAuthentication();
      setIsAuthenticatedLoader(false);
      setAuthenticationValue("Authentication Successful");
    } catch (error) {
      setIsAuthenticatedLoader(false);
      setAuthenticationValue("Authentication Failed");
      console.error('Authentication Error:', error);
    }
  }

  // Camera options
  const secretKey: CameraConfiguration = {
    lensFacing: LensFacing?.Front || "front",
    flashMode: FlashMode?.Off || "off",
    orientation: Orientation?.Portrait || "portrait",
    outputPath: "",
    frontResolutions: null,
    frontResolution: null,
    backResolutions: null,
    backResolution: null,
    mode: CameraMode.videoAndImage()
  };

  async function openCamera() {
    try {
      let mediaItems = [];
      const response = await initCameraScreen(secretKey);
      const resultData = response.value;
      console.log("resultData", resultData);
      if (typeof resultData === "string") {
        try {
          const parsed = JSON.parse(resultData);
          mediaItems = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error("Failed to parse camera response:", error);
        }
      }

      if (!Array.isArray(mediaItems)) {
        console.error("Camera Upload Failed: mediaItems is not an array.");
        return;
      }

      await uploadMediaItems(mediaItems);

      console.log("Media Items ", mediaItems);
      toast.success('Upload successful!');
    } catch (error) {
      console.error("Camera error:", error);
    }
  }

  const uploadMediaItems = async (mediaItems: MediaItem[]) => {
    const videoUrls = [];
    const imageUrls = [];

    for (const item of mediaItems) {
      try {
        const result = new MediaBuilder(item.filePath)
        // setTag
        result.setTag("key", "value");
        result.setTag("color", "red");
        result.setTag("orderNumber", "123");
        // setMetaData
        result.setMetaData("key", "value");
        result.setMetaData("key1", "1");
        result.setMetaData("key2", "[4,5,6]");
        // buiild request
        console.log(' successful: set data');
        var request = await result.build()
        console.log(' successful: set build');
        // handle callbacks
        const uploadCallbacks = {
          onProgress: (event: UploadProgressEvent) => {
            console.log(`ID: ${event.id}, Progress: ${event.progress}%`)
          },
          onComplete: (event: UploadCompleteEventData) => {
            console.log(`ID: ${event.id}, Type: ${event.fileType}`)
          },
          onError: (event: UploadErrorEvent) => {
            console.log(`ID: ${event.id}, Error: ${event.error}`)
          },
        };

        await request.upload(uploadCallbacks)

        const url = item.filePath;
        const type = item.type;

        if (url) {
          if (type === "VIDEO") {
            videoUrls.push(url);
          } else if (type === "PICTURE" || type === "IMAGE") {
            imageUrls.push(url);
          }
        }

        console.log('Upload successful:');
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    const previousImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    const updatedImages = [...previousImages, ...imageUrls];
    setUploadedImages(updatedImages);
    sessionStorage.setItem('uploadedImages', JSON.stringify(updatedImages));

    const previousVideos = JSON.parse(sessionStorage.getItem('uploadedVideos') || '[]');
    const updatedVideos = [...previousVideos, ...videoUrls];
    setUploadedVideos(updatedVideos);
    sessionStorage.setItem('uploadedVideos', JSON.stringify(updatedVideos));

    console.log("updatedVideos ", updatedVideos);
    console.log("updatedImages", updatedImages);

  };

  const handleImageClick = () => {
    if (uploadedImages.length > 0) {
      history.push('/image', {
        uploadedImages: uploadedImages
      });
    }
  }

  const handleVideoClick = () => {
    if (uploadedVideos.length > 0) {
      history.push('/video', {
        uploadedVideos: uploadedVideos
      });
    }
  }


  return (
    <div className="container">
      <h1 className="title">Hello Devs</h1>

      {/* Inline Loader */}
      {isAuthenticatedLoader ? (
        <div className="inline-loader">
          <div className="loader" />
          <span style={{ marginLeft: 10, marginBottom: 40 }}>Authenticating...</span>
        </div>
      ) :
        <h2 className="subtitle">{authenticationValue}</h2>
      }

      <div className="button-wrapper">
        <button className="button" onClick={openCamera}>📷 Camera</button>
      </div>
      <div className="button-wrapper">
        <button className="button" onClick={handleImageClick}>🖼️ Image</button>
      </div>
      <div className="button-wrapper">
        <button className="button" onClick={handleVideoClick}>🎥 Video</button>
      </div>

    </div>
  );
}

export default HomeComponent;
