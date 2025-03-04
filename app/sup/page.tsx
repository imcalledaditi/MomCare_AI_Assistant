"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoPage() {
  const [showVideo, setShowVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");

  const handleButtonClick = (src) => {
    setVideoSrc(src);
    setShowVideo(true);
  };

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center relative">
      <AnimatePresence>
        {!showVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex space-x-4"
          >
            <button
              onClick={() => handleButtonClick("/1.mp4")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg focus:outline-none"
            >
              Surprise Me
            </button>
            <button
              onClick={() => handleButtonClick("/2.mp4")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg focus:outline-none"
            >
              Surprise Me 2
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <video
              src={videoSrc}
              loop
              playsInline
              autoPlay
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
