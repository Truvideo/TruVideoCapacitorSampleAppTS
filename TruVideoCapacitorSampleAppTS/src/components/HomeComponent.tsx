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
      console.log("[openCamera] Triggered");

      const response = await initCameraScreen(secretKey);
      const resultData = response.value;

      let mediaItems: any[] = [];

      if (typeof resultData === "string") {
        try {
          const parsed = JSON.parse(resultData);
          mediaItems = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error("[openCamera] Failed to parse resultData:", error);
          return;
        }
      }

      if (!Array.isArray(mediaItems)) {
        console.error("[openCamera] Error: mediaItems is not an array:", mediaItems);
        return;
      }

      await uploadMediaItems(mediaItems);
      toast.success("Upload successful!");
    } catch (error) {
      console.error("[openCamera] Caught error:", error);
    }
  }


  const uploadMediaItems = async (mediaItems: MediaItem[]) => {
    console.log("[uploadMediaItems] Start | mediaItems:", mediaItems);

    const videoUrls: string[] = [];
    const imageUrls: string[] = [];

    for (const item of mediaItems) {
      try {
        console.log(`[uploadMediaItems] Processing item:`, item);

        const result = new MediaBuilder(item.filePath);
        console.log(`[uploadMediaItems] Initialized MediaBuilder for ${item.filePath}`);

        // Set tags
        result.setTag("key", "value");
        result.setTag("color", "red");
        result.setTag("orderNumber", "123");

        // Set metadata
        result.setMetaData("key", "value");
        result.setMetaData("key1", "1");
        result.setMetaData("key2", "[4,5,6]");

        // Build request
        const request = await result.build();
        console.log("[uploadMediaItems] Built upload request");

        // Upload
        const uploadCallbacks = {
          onProgress: (event: UploadProgressEvent) => {
            console.log(`[uploadMediaItems] Upload Progress | ID: ${event.id}, Progress: ${event.progress}%`);
          },
          onComplete: (event: UploadCompleteEventData) => {
            console.log(`[uploadMediaItems] Upload Complete | ID: ${event.id}, Type: ${event.fileType}`);
          },
          onError: (event: UploadErrorEvent) => {
            console.error(`[uploadMediaItems] Upload Error | ID: ${event.id}, Error: ${event.error}`);
          },
        };

        await request.upload(uploadCallbacks);
        console.log(`[uploadMediaItems] Upload finished for: ${item.filePath}`);

        // Categorize
        const url = item.filePath;
        const type = item.type;
        if (url) {
          if (type === "VIDEO") {
            videoUrls.push(url);
          } else if (type === "PICTURE" || type === "IMAGE") {
            imageUrls.push(url);
          }
        }

      } catch (error) {
        console.error("[uploadMediaItems] Caught upload error:", error, "for item:", item);
      }
    }

    console.log("[uploadMediaItems] Upload loop finished. Saving to session storage...");

    // Save images
    const previousImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    const updatedImages = [...previousImages, ...imageUrls];
    setUploadedImages(updatedImages);
    sessionStorage.setItem('uploadedImages', JSON.stringify(updatedImages));

    // Save videos
    const previousVideos = JSON.parse(sessionStorage.getItem('uploadedVideos') || '[]');
    const updatedVideos = [...previousVideos, ...videoUrls];
    setUploadedVideos(updatedVideos);
    sessionStorage.setItem('uploadedVideos', JSON.stringify(updatedVideos));

    console.log("[uploadMediaItems] Final updatedVideos:", updatedVideos);
    console.log("[uploadMediaItems] Final updatedImages:", updatedImages);
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
