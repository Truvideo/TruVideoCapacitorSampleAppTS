import React, { useEffect, useState } from "react";
import {
    getAllRequests,
    getRequestById,
    //VideoStatus,
    type BuilderResponse
} from "@trunpm/truvideo-capacitor-video-sdk";

const VideoRequestScreen: React.FC = () => {
  const [list, setList] = useState<BuilderResponse[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    allRequest();
  }, []);

  const allRequest = async () => {
    try {
      setLoading(true);

      //let videoStatus: VideoStatus = VideoStatus.idle;
      const requests: BuilderResponse[] = await getAllRequests(undefined);
      //console.log("Requests:", requests);
      if (requests.length > 0) {
        // Just for demo: deleting the first request
        //requests[0].delete();
        getRequestById(requests[0].id).then((response)=>{
            console.log("Request by ID Response:", response.type);
        }).catch((error)=>{
            console.error("Error fetching request by ID:", error);
        });
      }
      setList(requests);
    } catch (error) {
      console.error("Error retrieving requests:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        <h1 style={styles.title}>Video Requests</h1>

        {loading ? (
          <div style={styles.centered}>
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div style={styles.list}>
            {list?.map((item) => (
              <div key={item.id} style={styles.itemContainer}>
                <p style={styles.filePathText}>{"Id -" + item.id}</p>
                <p style={styles.filePathText}>{"Status -" +item.status}</p>
                <p style={styles.filePathText}>{"Type -" +item.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: any = {
  safeArea: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  container: {
    maxWidth: 600,
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },
  centered: {
    textAlign: "center",
  },
  list: {
    marginTop: 10,
  },
  itemContainer: {
    padding: 12,
    borderBottom: "1px solid #ddd",
  },
  filePathText: {
    fontSize: 12,
    color: "#030202ff",
  },
};

export default VideoRequestScreen;
