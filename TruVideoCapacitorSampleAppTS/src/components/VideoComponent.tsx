import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './../css/App.css';
import { cleanNoise, compareVideos, ConcatBuilder, editVideo, EncodeBuilder, FrameRate, generateThumbnail, getResultPath, getVideoInfo, MergeBuilder, type BuilderResponse } from '@trunpm/truvideo-capacitor-video-sdk';

function VideoComponent() {
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const multipleSelected = selectedVideos.length >= 2;
  const singleSelected = selectedVideos.length >= 1;
  const [isBuildComplete, setIsBuildComplete] = useState(false);
  const [currentBuilder, setCurrentBuilder] = useState<MergeBuilder | ConcatBuilder | EncodeBuilder | null>(null);

  // useEffect(() => {
  //   const subscription = TruvideoSdkCamera.addListener("cameraEvent", (event) => {
  //     console.log("Camera Event:", event.cameraEvent);
  //   });

  //   return () => {
  //     subscription?.remove?.();
  //   };
  // }, [uploadedVideos]);

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


  const safeFirstSelected = selectedVideos[0];

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

        setCurrentBuilder(builder);
        setIsBuildComplete(true);
        toast.success('Merge Build successful!');
      } catch (error) {
        console.error("Failed to merge videos:", error);
        toast.error('Merge Failed!');
      } finally {
        setSelectedVideos([]);
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
        setSelectedVideos([]);
      }
    },

    async generateThumbnail() {
      if (!safeFirstSelected) return;

      try {
        const resultPathResponse = await getResultPath(`${Date.now()}-thumbnail`);

        const {
          result
        } = resultPathResponse;

        const videoPath = safeFirstSelected;
        const position = 1000;
        const width = 640;
        const height = 480;
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

        setCurrentBuilder(builder);
        setIsBuildComplete(true);

        toast.success('Encode Build successful!');
      } catch (error) {
        console.error('Failed to Encode Video:', error);
        toast.error('Encode Failed!');
      } finally {
        setSelectedVideos([]);
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
        setSelectedVideos([]);
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
        setSelectedVideos([]);
      }
    },


    async concatVideos() {
      if (!safeFirstSelected || selectedVideos.length === 0) return;

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

        setCurrentBuilder(builder);
        setIsBuildComplete(true);

        toast.success('Concat Build successful!');
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
        const payload = JSON.stringify(safeFirstSelected);
        const result  = await getVideoInfo(payload);
        toast.success('Get Video Info successfully!');
        console.log("Get Video Info Response:", JSON.stringify(result));
        //console.log("Get Video Info Response:", result.format);
      } catch (error) {
        console.error("❌ Failed to Get Video Info:", error);
        toast.error('Failed to get Video Info!');
      } finally {
        setSelectedVideos([]);
      }
    },
  };

  const handleProcess = async () => {
    if (!currentBuilder) return;
    try {
      const processed = await currentBuilder.process();
      console.log("✅ Processed:", processed);
      setCurrentBuilder(null);
      setIsBuildComplete(false);

      toast.success("Process successful!");
    } catch (e) {
      setCurrentBuilder(null);
      setIsBuildComplete(false);
      console.error("❌ Process failed", e);
      toast.error("Process failed");
    }
  };

  const handleCancel = async () => {
    if (!currentBuilder) return;
    try {
      const cancelled = await currentBuilder.cancel();
      console.log("⛔ Cancelled:", cancelled);
      toast.info("Cancelled!");
    } catch (e) {
      console.error("❌ Cancel failed", e);
      toast.error("Cancel failed");
    }
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
              {
                label: 'Process Video',
                action: handleProcess,
                enabled: isBuildComplete,
              },
              {
                label: 'Cancel Video',
                action: handleCancel,
                enabled: isBuildComplete,
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