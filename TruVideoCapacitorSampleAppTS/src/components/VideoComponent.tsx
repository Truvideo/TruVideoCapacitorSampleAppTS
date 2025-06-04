import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './../css/App.css';

import { TruvideoSdkCamera } from 'truvideo-capacitor-camera-sdk';
import { TruvideoSdkVideo } from 'truvideo-capacitor-video-sdk';

function VideoComponent() {
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const multipleSelected = selectedVideos.length >= 2;
  const singleSelected = selectedVideos.length >= 1;

  useEffect(() => {
    const subscription = TruvideoSdkCamera.addListener("cameraEvent", (event) => {
      console.log("Camera Event:", event.cameraEvent);
    });

    return () => {
      subscription?.remove?.();
    };
  }, [uploadedVideos]);

  useEffect(() => {
    const savedVideos = JSON.parse(sessionStorage.getItem('uploadedVideos') || '[]');
    setUploadedVideos(savedVideos);
  }, []);



  const handleCheckboxChange = (url: string) => {
    setSelectedVideos((prevSelected) =>
      prevSelected.includes(url)
        ? prevSelected.filter((item) => item !== url)
        : [...prevSelected, url]
    );
  };

  const defaultConfig = {
    height: '640',
    width: '480',
    framesRate: 'twentyFourFps',
    videoCodec: 'h264',
  };

  const safeFirstSelected = selectedVideos[0];

  const apiHandlers = {
    async mergeVideos() {
      if (!safeFirstSelected) return;
      try {
        const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });
        const payload = {
          resultPath: resultPathResponse.resultPath,
          videoUris: JSON.stringify(selectedVideos),
          config: JSON.stringify(defaultConfig),
        };
        const { result } = await TruvideoSdkVideo.mergeVideos(payload);
        console.log("Merge Video Response:", result);
        toast.success('Merge successful!');
      } catch (error) {
        console.error("❌ Failed to Merge Videos:", error);
        toast.error('Merge Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async compareVideos() {
      if (!safeFirstSelected) return;
      const payload = {
        videoUris: JSON.stringify(selectedVideos),
      };
      try {
        const { result } = await TruvideoSdkVideo.compareVideos(payload);
        console.log("Comparison result:", result);
        toast.success('Compare successful!');
      } catch (error) {
        console.error("❌ Failed to Compare Videos:", error);
        toast.error('Compare Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async generateThumbnail() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });
        const payload = {
          resultPath: resultPathResponse.resultPath,
          videoPath: safeFirstSelected,
          config: JSON.stringify(defaultConfig),
          position: 1000,
          width: 640,
          height: 480,
          precise: false,
        };
        const { result } = await TruvideoSdkVideo.generateThumbnail(payload);
        console.log("Thumbnail Generation Result:", result);
        toast.success('Thumbnail Generation successful!');
      } catch (error) {
        console.error("❌ Failed to Generate Thumbnail:", error);
        toast.error('Thumbnail Generation Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async encodeVideo() {
      if (!safeFirstSelected) return;
      const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });
      try {
        const payload = {
          resultPath: resultPathResponse.resultPath,
          videoUri: JSON.stringify(safeFirstSelected),
          config: JSON.stringify(defaultConfig),
        };
        const { result } = await TruvideoSdkVideo.encodeVideo(payload);
        console.log("Encode Result:", result);
        toast.success('Encode successful!');
      } catch (error) {
        console.error("❌ Failed to Encode Video:", error);
        toast.error('Encode Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async cleanNoise() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });
        const payload = {
          resultPath: resultPathResponse.resultPath,
          videoPath: safeFirstSelected,
        };
        const { result } = await TruvideoSdkVideo.cleanNoise(payload);
        console.log("Clean Noise Result:", result);
        toast.success('Clean Noise successful!');
      } catch (error) {
        console.error("❌ Failed to Clean Noise:", error);
        toast.error('Clean Noise Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async editVideo() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });
        const payload = {
          resultPath: resultPathResponse.resultPath,
          videoPath: safeFirstSelected,
          config: JSON.stringify(defaultConfig),
        };
        const { result } = await TruvideoSdkVideo.editVideo(payload);
        console.log("Edit Video Response:", result);
        toast.success('Edit successful!');
      } catch (error) {
        console.error("❌ Failed to Edit Video:", error);
        toast.error('Edit Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async concatVideos() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });
        const payload = {
          resultPath: resultPathResponse.resultPath,
          videoUris: JSON.stringify(selectedVideos),
        };
        const { result } = await TruvideoSdkVideo.concatVideos(payload);
        console.log("Concat Video Response:", result);
        toast.success('Concat successful!');
      } catch (error) {
        console.error("❌ Failed to Concat Videos:", error);
        toast.error('Concat Failed!');
      } finally {
        setSelectedVideos([]);
      }
    },

    async getVideoInfo() {
      if (!safeFirstSelected) return;
      try {
        const payload = { videoPath: JSON.stringify(safeFirstSelected) };
        const { result } = await TruvideoSdkVideo.getVideoInfo(payload);
        toast.success('Get Video Info successfully!');
        console.log("Get Video Info Response:", result);
      } catch (error) {
        console.error("❌ Failed to Get Video Info:", error);
        toast.error('Failed to get Video Info!');
      } finally {
        setSelectedVideos([]);
      }
    },
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh',
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
                checked={selectedVideos.includes(url)}
                onChange={() => handleCheckboxChange(url)}
                style={styles.checkbox as any}
              />
              <span style={styles.text as any}>{url.split('/').pop()}</span>
            </div>
          ))}

          <div style={styles.buttonGroup as any}>
            {[
              {
                label: 'Merge Videos',
                action: apiHandlers.mergeVideos,
                enabled: multipleSelected,
              },
              {
                label: 'Compare Videos',
                action: apiHandlers.compareVideos,
                enabled: multipleSelected,
              },
              {
                label: 'Concat Videos',
                action: apiHandlers.concatVideos,
                enabled: multipleSelected,
              },
              {
                label: 'Generate Thumbnail',
                action: apiHandlers.generateThumbnail,
                enabled: singleSelected,
              },
              {
                label: 'Encode Video',
                action: apiHandlers.encodeVideo,
                enabled: singleSelected,
              },
              {
                label: 'Clean Noise',
                action: apiHandlers.cleanNoise,
                enabled: singleSelected,
              },
              {
                label: 'Edit Video',
                action: apiHandlers.editVideo,
                enabled: singleSelected,
              },
              {
                label: 'Get Video Info',
                action: apiHandlers.getVideoInfo,
                enabled: singleSelected,
              },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                style={{
                  ...styles.button,
                  backgroundColor: btn.enabled ? '#3490CA' : '#ccc',
                  cursor: btn.enabled ? 'pointer' : 'not-allowed',
                } as any}
                disabled={!btn.enabled}
              >
                {btn.label}
              </button>
            ))}
          </div>
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


export default VideoComponent