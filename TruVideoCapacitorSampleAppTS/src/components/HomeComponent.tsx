import './../css/App.css';
import './../css/home.css';

import { TruvideoSdkCamera, LensFacing, FlashMode, Orientation, Mode } from 'truvideo-capacitor-camera-sdk';
import { TruVideoSdkCore } from 'truvideo-capacitor-core-sdk';
import { TruvideoSdkMedia } from 'truvideo-capacitor-media-sdk';

import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';


function HomeComponent() {

  const [isAuthenticatedLoader, setIsAuthenticatedLoader] = useState<boolean>(false);
  const [authenticationValue, setAuthenticationValue] = useState<string | undefined>(undefined);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  const history = useHistory();

  // Setup event listeners on mount
  useEffect(() => {
    let cameraListener: PluginListenerHandle;
    let onUploadProgress: PluginListenerHandle;
    let onUploadError: PluginListenerHandle;
    let onUploadComplete: PluginListenerHandle;


    const setupListeners = async () => {
      cameraListener = TruvideoSdkCamera.addListener("cameraEvent", (event) => {
        console.log("Received Camera Event:", event.cameraEvent);
      });
      onUploadProgress = await TruvideoSdkMedia.addListener('onProgress', (event) => {
        console.log(`Progress: ${event.progress} for ${event.id}`);
      });

      onUploadError = await TruvideoSdkMedia.addListener('onError', (event) => {
        console.error(`Error on ${event.id}`, event.error);
      });

      onUploadComplete = await TruvideoSdkMedia.addListener('onComplete', (event) => {
        console.log(`Upload complete for ${event.id}`);
      });
    };

    setupListeners();

    // Cleanup listeners on   unmount
    return () => {
      console.log("🧹 Removing upload event listeners...");
      cameraListener.remove();
      onUploadProgress.remove();
      onUploadError.remove();
      onUploadComplete.remove();
    };
  }, []);


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

      const apiKey = "Enter API Key";
      const secretKey = "Enter Secret key";

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
  const secretKey = {
    lensFacing: LensFacing?.Front || "front",
    flashMode: FlashMode?.Off || "off",
    orientation: Orientation?.Portrait || "portrait",
    outputPath: "",
    frontResolutions: [],
    frontResolution: null,
    backResolutions: [],
    backResolution: null,
    mode: Mode.VideoAndPicture || "videoAndPicture"

  };

  // Formatted options for consistency
  const formattedSecretKey = {
    ...secretKey,
    lensFacing: String(secretKey.lensFacing),
    flashMode: String(secretKey.flashMode),
    orientation: String(secretKey.orientation),
    mode: String(secretKey.mode)
  };
  async function openCamera() {
    try {
      const jsonString = JSON.stringify(formattedSecretKey);
      let mediaItems = [];

      const response = await TruvideoSdkCamera.initCameraScreen({ configuration: jsonString });
      console.log("response", response);
      const resultData = response.result;
      console.log("resultData", resultData);
      if (typeof resultData === "string") {
        try {
          // mediaItems = JSON.parse(resultData).result || [];
          mediaItems = JSON.parse(resultData) || [];
        } catch (error) {
          console.error("Failed to parse camera response:", error);
        }
      } else if (Array.isArray(resultData)) {
        mediaItems = resultData;
      }

      if (!Array.isArray(mediaItems)) {
        console.error("Camera Upload Failed: mediaItems is not an array.");
        return;
      }

      const videoUrls = [];
      const imageUrls = [];
      console.log("Media Items ", mediaItems);
      for (const item of mediaItems) {
        try {
          if (!item?.filePath) continue;  // Skip invalid entries

          const payload = {
            filePath: item.filePath,
            tag: JSON.stringify({ key: "value", color: "red", orderNumber: "123" }),
            metaData: JSON.stringify({ key: "value", key1: 1, key2: [4, 5, 6] })
          };

          await TruvideoSdkMedia.uploadMedia(payload);

          const url = item.filePath;
          const type = item.type;

          if (url) {
            if (type === "VIDEO") {
              videoUrls.push(url);
            } else if (type === "PICTURE" || type === "IMAGE") {
              imageUrls.push(url);
            }
          }
        } catch (uploadError) {
          console.error("Upload failed for:", item?.filePath, uploadError);
        }
      }

      // Update state and session storage
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
      toast.success('Upload successful!');
    } catch (error) {
      console.error("Camera error:", error);
    }
  }

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
