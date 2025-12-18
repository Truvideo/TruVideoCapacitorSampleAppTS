import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './../css/App.css';
import { cleanNoise, compareVideos, ConcatBuilder, editVideo, EncodeBuilder, FrameRate, generateThumbnail, getResultPath, getVideoInfo, MergeBuilder, type BuilderResponse } from '@trunpm/truvideo-capacitor-video-sdk';
import { MediaBuilder,
  type UploadCompleteEventData, 
  type UploadErrorEvent,
  type UploadProgressEvent 
  } from '@trunpm/truvideo-capacitor-media-sdk';
import { Filesystem, Directory, 
    //Encoding
 } from '@capacitor/filesystem';
//import { Capacitor } from '@capacitor/core';


function VideoDownload() {
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string | null>();
//   const multipleSelected = selectedVideos.length >= 2;
//   const singleSelected = selectedVideos.length >= 1;
  //const [isBuildComplete, setIsBuildComplete] = useState(false);
  //const [currentBuilder, setCurrentBuilder] = useState<MergeBuilder | ConcatBuilder | EncodeBuilder | null>(null);

  // useEffect(() => {
  //   const subscription = TruvideoSdkCamera.addListener("cameraEvent", (event) => {
  //     console.log("Camera Event:", event.cameraEvent);
  //   });

  //   return () => {
  //     subscription?.remove?.();
  //   };
  // }, [uploadedVideos]);

  useEffect(() => {
    //const savedVideos = JSON.parse(sessionStorage.getItem('uploadedVideos') || '[]');
    const savedVideos = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    setUploadedVideos(savedVideos);
  }, []);




  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [downloadPath, setDownloadPath] = useState<string | null>(null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  //const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = (url: string) => {
    setSelectedVideos(prev => (prev === url ? null : url));
    setRemoteUrl(null);
    setDownloadPath(null);
    setThumbnailPath(null);
  };


    const safeFirstSelected = selectedVideos ? selectedVideos : null;
    const downloadVideo = async (remoteUrl: string): Promise<string> => {
        try {
            const fileName = `download_video_${Date.now()}.mp4`;
            const folderPath = 'videos'; // folder in scoped storage

            // ✅ Ensure folder exists (recursive creates parent folders if needed)
            await Filesystem.mkdir({
            path: folderPath,
            directory: Directory.Data,
            recursive: true,
            }).catch(() => {
            // Ignore error if folder already exists
            });

            // Fetch video
            const response = await fetch(remoteUrl);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const blob = await response.blob();

            // Convert blob to base64
            const base64Data = await convertBlobToBase64(blob);
            //const corruptBase64 = base64Data.substring(0, base64Data.length / 2);

            // ✅ Save to the created folder
            const result = await Filesystem.writeFile({
            path: `${folderPath}/${fileName}`,
            data: base64Data as string,
            directory: Directory.Data,
            recursive: true, // ensure parent directory creation
            });

            //const uri = Capacitor.convertFileSrc(result.uri);
            const nativePath = result.uri
                                .replace('file://', '')
                                .replace('https://localhost/_capacitor_file_/', '/');
            console.log('✅ Video saved at:', nativePath);
            setDownloadPath(nativePath);
            return nativePath;
        } catch (error) {
            console.error('❌ downloadVideo error:', error);
            throw error;
        }
    };

    // Convert Blob → Base64
    const convertBlobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
            };
            reader.readAsDataURL(blob);
        });


  const uploadMediaItems = async () => {
    // const uploadMediaItems = async (mediaItems: CameraResult[]) => {
      console.log("[uploadMediaItems] Start | mediaItems:", safeFirstSelected);
  
    //   const videoUrls: string[] = [];
    //   const imageUrls: string[] = [];
    //   for (const item of mediaItems) { 
    //       const url = item.filePath;
    //       const type = item.type;
    //         if (url) {
    //         if (type === "VIDEO") {
    //           videoUrls.push(url);
    //         } else if (type === "PICTURE" || type === "IMAGE") {
    //           imageUrls.push(url);
    //         }
    //       }
    //   }

    if(safeFirstSelected == null){
        return;
    }
  
      //for (const item of mediaItems) {
        try {
            setRemoteUrl(null);
            setDownloadPath(null);
            setThumbnailPath(null);
          console.log(`[uploadMediaItems] Processing item:`, safeFirstSelected);
          const result = new MediaBuilder(safeFirstSelected);
          console.log(`[uploadMediaItems] Initialized MediaBuilder for ${safeFirstSelected}`);
  
          // Set tags
          result.setTag("key", "value");
          result.setTag("color", "red");
          result.setTag("orderNumber", "123");
  
          result.setIsLibrary(true);
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
              console.log(`[uploadMediaItems] Upload Complete | ID: ${event.id}, Type: ${event.fileType}, Date: ${event.createdDate}
                , RemoteID: ${event.remoteId}, UploadedFileURL: ${event.uploadedFileURL}, TranscriptionURL: ${event.transcriptionURL}, 
                TranscriptionLength: ${event.transcriptionLength} MetaData: ${JSON.stringify(event.metaData)}, Tags: ${JSON.stringify(event.tags)}  
                Status: ${request.mediaDetail?.status}`);
                setRemoteUrl("https://sdkmobileapi-e1e80399-c2bc-49dc-9fd4-a056fad618fe.s3.us-west-2.amazonaws.com/media/e0024781-35ea-4919-ad4a-d686b068bbba.mp4");
            },
            onError: (event: UploadErrorEvent) => {
              console.error(`[uploadMediaItems] Upload Error | ID: ${event.id}, Error: ${event.error}`);
            }
          };
  
          
          
          const res = await result.upload(uploadCallbacks);
          console.log(`[uploadMediaItems] Upload finished for: ${res}`);
          toast.success("Upload successful!");
  
          // Categorize
          
  
          // if (url) {
          //   if (type === CameraMediaType.video) {
          //     videoUrls.push(url);
          //   } else if (type === CameraMediaType.image) {
          //     imageUrls.push(url);
          //   }
          // }
  
        } catch (error) {
          console.error("[uploadMediaItems] Caught upload error:", error, "for item:", safeFirstSelected);
          toast.error(`Upload failed for item: ${safeFirstSelected}`);
        }
      //}
  
    //   console.log("[uploadMediaItems] Upload loop finished. Saving to session storage...");
  
    //   // Save images
    //   const previousImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    //   const updatedImages = [...previousImages, ...imageUrls];
    //   //setUploadedImages(updatedImages);
    //   sessionStorage.setItem('uploadedImages', JSON.stringify(updatedImages));
  
    //   // Save videos
    //   const previousVideos = JSON.parse(sessionStorage.getItem('uploadedVideos') || '[]');
    //   const updatedVideos = [...previousVideos, ...videoUrls];
    //   setUploadedVideos(updatedVideos);
    //   sessionStorage.setItem('uploadedVideos', JSON.stringify(updatedVideos));
  
    //   console.log("[uploadMediaItems] Final updatedVideos:", updatedVideos);
    //   console.log("[uploadMediaItems] Final updatedImages:", updatedImages);
    };

  const apiHandlers = {
    async mergeVideos() {
      if (!safeFirstSelected) {
        console.warn("No videos selected for merging.");
        return;
      }

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail.mp4`);
        const builder = new MergeBuilder(JSON.stringify(selectedVideos), resultPathResponse.result)
          .setHeight(720)
          .setWidth(1280)
          .setFrameRate(FrameRate.thirtyFps);

        await builder.build();
        const response : BuilderResponse = await builder.process();
        console.log("Success Builder Function", JSON.stringify(response));  

        //setCurrentBuilder(builder);
        //setIsBuildComplete(true);
        toast.success('Merge Build successful!');
      } catch (error) {
        console.error("Failed to merge videos:", error);
        toast.error('Merge Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },

    async downloadVideo (){
        if (remoteUrl == null) {
            console.warn("No remote URL available for download.");
            return;
        }
        try {
            const localPath = await downloadVideo(remoteUrl);
            console.log('Downloaded path:', localPath);
        }catch (error) {    
            console.error('Download failed:', error);
        }
    },
    


    async compareVideos() {
      if (!safeFirstSelected) return;
      const videoPath = JSON.stringify(selectedVideos)
        ;
      try {
        const result = await compareVideos(videoPath);
        
        console.log(`Comparison result: ${result}`);
        console.log("Comparison result: ", result);
        toast.success('Compare successful!');
      } catch (error) {
        console.error("❌ Failed to Compare Videos:", error);
        toast.error('Compare Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },

    async generateThumbnail() {
      if (!downloadPath) {
        toast.error('No downloaded video path available for thumbnail generation!');
        return;
      }

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail`);

        const {
          result
        } = resultPathResponse;
        console.log("Downladed path:", downloadPath);
        const videoPath = downloadPath;
        const position = 1;
        const width = 269;
        const height = 208;
        const precise = false;

        const { result: thumbnailPath } = await generateThumbnail(
          videoPath,
          result,
          position,
          width,
          height,
          precise
        );
        console.log("Thumbnail Generation Result:", thumbnailPath);
        
        setThumbnailPath(""+thumbnailPath);
        toast.success('Thumbnail Generation successful!');
      } catch (error) {
        console.error("❌ Failed to Generate Thumbnail:", error);
        toast.error('Thumbnail Generation Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },

    async encodeVideo() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail.mp4`);

        const builder = new EncodeBuilder(
          JSON.stringify(safeFirstSelected),
          resultPathResponse.result
        )
          .setHeight(720)
          .setWidth(1280)
          .setFrameRate(FrameRate.thirtyFps);

        await builder.build();
        const response : BuilderResponse = await builder.process();
        console.log("Success Builder Function", JSON.stringify(response));

        //setCurrentBuilder(builder);
        //setIsBuildComplete(true);

        toast.success('Encode Build successful!');
      } catch (error) {
        console.error('Failed to Encode Video:', error);
        toast.error('Encode Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },

    async cleanNoise() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail`);
        // const payload = {
        //   resultPath: resultPathResponse.resultPath,
        //   videoPath: safeFirstSelected,
        // };
        const { result } = await cleanNoise(safeFirstSelected, resultPathResponse.result);
        console.log("Clean Noise Result:", result);
        toast.success('Clean Noise successful!');
      } catch (error) {
        console.error("❌ Failed to Clean Noise:", error);
        toast.error('Clean Noise Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },

    async editVideo() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail`);
        const { result } = await editVideo(safeFirstSelected, resultPathResponse.result);
        console.log("Edit Video Response:", result);
        if (result) toast.success('Edit successful!');
      } catch (error) {
        console.error("❌ Failed to Edit Video:", error);
        toast.error('Edit Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },


    async concatVideos() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-concat`);

        const builder = new ConcatBuilder(
          JSON.stringify(selectedVideos),
          resultPathResponse.result
        );

        await builder.build();
        console.log("Success Builder Function");
        const response : BuilderResponse = await builder.process();
        console.log("Success Builder Function", JSON.stringify(response));

        //setCurrentBuilder(builder);
        //setIsBuildComplete(true);

        toast.success('Concat Build successful!');
      } catch (error) {
        console.error("❌ Failed to Concat Videos:", error);
        toast.error('Concat Failed!');
      } finally {
        setSelectedVideos(null);
      }
    },

    async getVideoInfo() {
      if (!safeFirstSelected) return;
      try {
        const payload = JSON.stringify(safeFirstSelected);
        const result  = await getVideoInfo(payload);
        toast.success('Get Video Info successfully!');
        console.log("Get Video Info Response:", JSON.stringify(result));
        //console.log("Get Video Info Response:", result.format);
      } catch (error) {
        console.error("❌ Failed to Get Video Info:", error);
        toast.error('Failed to get Video Info!');
      } finally {
        setSelectedVideos(null);
      }
    },
  };



  return (
    <div style={{
      ...styles.container,
      backgroundColor: '#ffffff',
      color: '#000000',
      height: '100vh',
      overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 70,
    }}>
      <div style={{ marginBottom: 30 }} />

      {/* Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3490CA',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ← Back
        </button>
      </div>
      <div style={{ marginBottom: 30 }} />

      {uploadedVideos.length > 0 ? (
        <>
          {uploadedVideos.map((url, index) => (
            <div key={index} style={styles.item}>
              <input
                type="checkbox"
                checked={selectedVideos === url}
                onChange={() => handleCheckboxChange(url)}
                style={styles.checkbox as any}
                />
              <span style={styles.text as any}>{url.split('/').pop()}</span>
            </div>
          ))}

            <div className="button-wrapper">
                <button className="button" onClick={uploadMediaItems} style={{ ...styles.fullWidthButton, backgroundColor: '#3490CA' }}>Upload Video</button>
            </div>

            {/* <div className="button-wrapper">
                <button className="button" onClick={apiHandlers.generateThumbnail}>Generate Thumbnail</button>
            </div> */}


            {/* Step 1: Remote URL */}
            {remoteUrl && (
                <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Remote URL:</label>
                <input
                    type="text"
                    readOnly
                    value={remoteUrl}
                    style={{ width: '100%', padding: 8, marginBottom: 12 }}
                />

                {/* Step 2: Download Button */}
                <button
                    onClick={apiHandlers.downloadVideo}
                    style={{ ...styles.fullWidthButton, backgroundColor: '#3490CA' }}
                >
                    Download Video
                </button>
                </div>
            )}

            {/* Step 3: Downloaded Path */}
            {downloadPath && (
                <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Downloaded Path:</label>
                <input
                    type="text"
                    readOnly
                    value={downloadPath}
                    style={{ width: '100%', padding: 8, marginBottom: 12 }}
                />

                {/* Step 4: Generate Thumbnail Button */}
                <button
                    onClick={apiHandlers.generateThumbnail}
                    style={{ ...styles.fullWidthButton, backgroundColor: '#3490CA' }}
                >
                    Generate Thumbnail
                </button>
                </div>
            )}

            {/* Step 5: Thumbnail Path */}
            {thumbnailPath && (
                <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Thumbnail Path:</label>
                <input
                    type="text"
                    readOnly
                    value={thumbnailPath}
                    style={{ width: '100%', padding: 8 }}
                />
                </div>
            )}
          
        </>
      ) : (
        <p style={styles.emptyText}>No videos available.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 16,
    fontFamily: 'Arial, sans-serif',
    maxWidth: 500,
    margin: '0 auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    border: '1px solid #ddd',
    gap: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    wordBreak: 'break-all',
  },
  buttonGroup: {
    marginTop: 20,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  fullWidthButton: {
    width: '100%',
    textAlign: 'center' as const,
    padding: '12px 0',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'background-color 0.2s ease-in-out',
  },
  button: {
    padding: '12px 18px',
    border: 'none',
    borderRadius: 25,
    fontSize: 14,
    minWidth: 140,
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: '#888',
    fontSize: 16,
  },
};


export default VideoDownload