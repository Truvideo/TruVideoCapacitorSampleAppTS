import { useEffect, useState } from 'react';
import { TruvideoSdkImage } from '@trunpm/truvideo-capacitor-image-sdk'
import { getResultPath } from '@trunpm/truvideo-capacitor-video-sdk';
import { toast } from 'react-toastify';

function ImageComponent() {

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  console.log("uploadedImages", uploadedImages);

  // useEffect(() => {
  //   const subscription = TruvideoSdkCamera.addListener("cameraEvent", (event) => {
  //     console.log("Camera Event:", event.cameraEvent);
  //   });
  //   return () => {
  //     subscription?.remove?.();
  //   };
  // }, []);

  useEffect(() => {
    const savedImages = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    setUploadedImages(savedImages);
  }, []);



  async function editImage() {
    if (!selectedImages[0]) return;

    try {
      const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail`);

      const payload = {
        inputPath: selectedImages[0],
        outputPath: resultPathResponse.result
      };
      console.log("Edited Image Response:", JSON.stringify(payload, null, 2));
      const { result } = await TruvideoSdkImage.editImage(payload);
      console.log("Edited Image Response:", result);
      if (result) toast.success("Process successful!");
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
    <div 
      style={{
        ...styles.container,
        backgroundColor: '#ffffff',
        color: '#000000',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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

      {/* Scrollable List */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 70 }}>
        {uploadedImages.length > 0 ? (
          uploadedImages.map((url, index) => (
            <div
              key={index}
              style={{
                ...styles.item,
                cursor: 'pointer', // shows clickable cursor
                backgroundColor: selectedImages.includes(url) ? '#e0f0ff' : '#f9f9f9', // optional: highlight selection
              }}
              onClick={() => handleCheckboxChange(url)} // entire div clickable
            >
              <input
                type="checkbox"
                checked={selectedImages.includes(url)}
                //onClick={(e) => e.stopPropagation()} // prevent double trigger
                style={styles.checkbox}
              />
              <span style={styles.text}>{url.split('/').pop()}</span>
            </div>
          ))
        ) : (
          <p style={styles.emptyText}>No images available.</p>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div style={styles.fixedButtonContainer}>
        <button
          disabled={selectedImages.length === 0}
          style={{
            width: '90%',
            backgroundColor: selectedImages.length === 0 ? '#ccc' : '#3490CA',
            cursor: selectedImages.length === 0 ? 'not-allowed' : 'pointer',
            padding: '12px',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            minWidth: 120,
            textAlign: 'center' as const, // ✅ Fix for textAlign type
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s ease',
          }}
          onClick={editImage}
        >
          Edit Image
        </button>
      </div>
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
  fixedButtonContainer: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    boxShadow: '0 -2px 6px rgba(0,0,0,0.1)',
  },
};
export default ImageComponent