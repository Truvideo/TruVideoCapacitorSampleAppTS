import './../css/App.css';
import './../css/home.css';

import { LensFacing, FlashMode, Orientation, CameraMode, initCameraScreen,ImageFormat, type CameraConfiguration } from '@trunpm/truvideo-capacitor-camera-sdk';
// import { LensFacing, FlashMode, Orientation, CameraMode, initCameraScreen,ImageFormat, type CameraConfiguration, type CameraResult, CameraMediaType, type Resolution } from 'truvideo-capacitor-camera-sdk';
import { TruVideoSdkCore } from '@trunpm/truvideo-capacitor-core-sdk';
import {  MediaBuilder, type UploadCompleteEventData, type UploadErrorEvent, type UploadProgressEvent } from '@trunpm/truvideo-capacitor-media-sdk';
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


//     "truvideo-capacitor-camera-sdk": "github:Truvideo/TruVideoCapacitorCameraSdk#version-78",
//     "truvideo-capacitor-core-sdk": "github:Truvideo/TruVideoCapacitorCoreSdk#version-78",
//     "truvideo-capacitor-image-sdk": "github:Truvideo/TruVideoCapacitorImageSdk#version-78",
//     "truvideo-capacitor-media-sdk": "github:Truvideo/TruVideoCapacitorMediaSDK#version-78",
//     "truvideo-capacitor-video-sdk": "github:Truvideo/TruVideoCapacitorVideoSdk#version-78"

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
      console.log("isAuth:", isAuth.isAuthenticated);
      console.log("isAuthExpired:", isAuthExpired.isAuthenticationExpired);

      // Generate payload and signature

      const payload = await TruVideoSdkCore.generatePayload();
      const pay = String(payload.generatePayload);

      const apiKey = "EPhPPsbv7e";
      const secretKey = "9lHCnkfeLl";

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
  // const resolution : Resolution = { 
  //   width: 1920,
  //   height: 1080
  // }
  // const resolution2 : Resolution = { 
  //   width: 1280,
  //   height: 720
  // }

  // const secretKey: CameraConfiguration = {
  //   lensFacing: LensFacing?.Front || "front",
  //   flashMode: FlashMode?.Off || "off",
  //   orientation: Orientation?.Portrait || "portrait",
  //   outputPath: "",
  //   frontResolutions: [resolution,resolution2],
  //   frontResolution: resolution,
  //   backResolutions: [resolution,resolution2],
  //   backResolution: resolution,
  //   mode: CameraMode.videoAndImage(),
  //   imageFormat: ImageFormat.JPEG, 
  // };

   const secretKey: CameraConfiguration = {
    lensFacing: LensFacing?.Back,
    flashMode: FlashMode?.Off,
    orientation: Orientation?.Portrait,
    outputPath: "",
    frontResolutions: null,
    frontResolution: null,
    backResolutions: null,
    backResolution: null,
    mode: CameraMode.videoAndImage(),
    imageFormat : ImageFormat.JPEG,
  };

  async function openCamera() {
    try {
      console.log("[openCamera] Triggered");

      const response = await initCameraScreen(secretKey);
      const resultData = response.value;
      console.log("[openCamera] Camera response:", response.value);

      let mediaItems: any[] = [];

      // let mediaItems: CameraResult[] = response.value;
      // for (const item of mediaItems) {
      //   console.log("[openCamera] Media id:", item.id);
      //   console.log("[openCamera] Media filePath:", item.filePath);
      //   console.log("[openCamera] Media type:", item.type);
      //   console.log("[openCamera] Media duration:", item.duration);
      //   console.log("[openCamera] Media createdAt:", item.createdAt);
      //   console.log("[openCamera] Media rotation:", item.orientation);
      //   console.log("[openCamera] Media resolution:", item.resolution);
      //   console.log("[openCamera] Media cameraLensFacing:", item.lensFacing);  
      // }

     
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
  // const uploadMediaItems = async (mediaItems: CameraResult[]) => {
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
        console.log(`[uploadMediaItems] Built upload request ${request}}`);
        

        // Upload
        const uploadCallbacks = {
          onProgress: (event: UploadProgressEvent) => {
            console.log(`[uploadMediaItems] Upload Progress | ID: ${event.id}, Progress: ${event.progress}%`);
          },
          onComplete: (event: UploadCompleteEventData) => {
            console.log(`[uploadMediaItems] Upload Complete | ID: ${event.id}, Type: ${event.fileType}, URL: ${event.createdDate}
              , RemoteID: ${event.remoteId}, UploadedFileURL: ${event.uploadedFileURL}, TranscriptionURL: ${event.transcriptionURL}, 
              TranscriptionLength: ${event.transcriptionLength} MetaData: ${JSON.stringify(event.metaData)}, Tags: ${JSON.stringify(event.tags)}  `);
          },
          onError: (event: UploadErrorEvent) => {
            console.error(`[uploadMediaItems] Upload Error | ID: ${event.id}, Error: ${event.error}`);
          },
        };

        const res = await result.upload(uploadCallbacks);
        console.log(`[uploadMediaItems] Upload finished for: ${res}`);

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

        // if (url) {
        //   if (type === CameraMediaType.video) {
        //     videoUrls.push(url);
        //   } else if (type === CameraMediaType.image) {
        //     imageUrls.push(url);
        //   }
        // }

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
   const clearAuth = () => {
    TruVideoSdkCore.clearAuthentication();
    setAuthenticationValue("Authentication Cleared");
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
      <div className="button-wrapper">
        <button className="button" onClick={clearAuth}>Clear Auth</button>
      </div>

    </div>
  );
}

export default HomeComponent;
