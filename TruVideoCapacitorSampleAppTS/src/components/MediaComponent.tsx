import { useState } from "react";
import ImageComponent from "./ImageComponent";
import VideoComponent from "./VideoComponent";

export default function MediaComponent() {
    const [activeTab, setActiveTab] = useState("video");
  
    return (
        <>
        <br></br>
        <br></br>
        <br></br>
        <div className="min-h-screen bg-gray-100">
            {/* Header Menu */}
            <header className="bg-white shadow p-4 flex gap-4">
            <button
                onClick={() => setActiveTab("video")}
                className={`px-4 py-2 rounded ${
                activeTab === "video" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
            >
                Video
            </button>
            <button
                onClick={() => setActiveTab("image")}
                className={`px-4 py-2 rounded ${
                activeTab === "image" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
            >
                Image
            </button>
            </header>
    
            {/* Content */}
            <main className="p-6">
            {activeTab === "video" && <VideoComponent />}
            {activeTab === "image" && <ImageComponent />}
            </main>
        </div>
      </>
    );
  }