import { useEffect, useState } from 'react';

import { TruvideoSdkCamera } from 'truvideo-capacitor-camera-sdk';
import { TruvideoSdkImage } from 'truvideo-capacitor-image-sdk'
import { TruvideoSdkVideo } from 'truvideo-capacitor-video-sdk';

function ImageComponent() {
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  console.log("uploadedImages", uploadedImages);

  useEffect(() => {
    const subscription = TruvideoSdkCamera.addListener("cameraEvent", (event) => {
      console.log("Camera Event:", event.cameraEvent);
    });
    return () => {
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    const savedImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    setUploadedImages(savedImages);
  }, []);



  async function editImage() {
    if (!selectedImages[0]) return;

    try {
      const resultPathResponse = await TruvideoSdkVideo.getResultPath({ path: `${Date.now()}-thumbnail` });

      const payload = {
        inputPath: selectedImages[0],
        outputPath: resultPathResponse.resultPath,
      };

      const { result } = await TruvideoSdkImage.editImage(payload);
      console.log("Edit Image Response:", result);
    } catch (error) {
      console.error("❌ Failed to Edit Image:", error);
    } finally {
      setSelectedImages([]);
    }
  }

  const handleCheckboxChange = (url: string) => {
    setSelectedImages((prevSelected) =>
      prevSelected.includes(url)
        ? prevSelected.filter((item) => item !== url)
        : [...prevSelected, url]
    );
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

      {uploadedImages.length > 0 ? (
        <>
          {uploadedImages.map((url, index) => (
            <div key={index} style={styles.item}>
              <input
                type="checkbox"
                checked={selectedImages.includes(url)}
                onChange={() => handleCheckboxChange(url)}
                style={styles.checkbox}
              />
              {/* <span style={styles.text}>{url}</span> */}
              <span style={styles.text}>{url.split('/').pop()}</span>

            </div>
          ))}

          <div style={styles.buttonContainer}>
            <button
              disabled={selectedImages.length === 0}
              style={{
                ...styles.button,
                backgroundColor: selectedImages.length === 0 ? '#ccc' : '#3490CA' as const,
                cursor: selectedImages.length === 0 ? 'not-allowed' : 'pointer' as const,
              } as any}
              onClick={editImage}
            >
              Edit Image
            </button>
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
    maxWidth: 500,
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
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
    wordBreak: 'break-all' as const,
  },
  buttonContainer: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    padding: '14px 28px',
    color: '#fff',
    border: 'none',
    borderRadius: 25,
    fontSize: 18,
    minWidth: 200,
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'opacity 0.3s ease',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: '#888',
    fontSize: 16,
  },
};
export default ImageComponent