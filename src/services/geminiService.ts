import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";
import Lightbox from "./components/Lightbox";

// Initialize Gemini Client
// Note: In a real production app, you might proxy this through a backend to hide the key,
// but for this client-side demo requirement, we use process.env.API_KEY directly.
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY
});

export const analyzeMedia = async (
  base64Data: string,
  mimeType: string
): Promise<AISuggestion> => {
  try {
    const modelId = 'gemini-2.5-flash'; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Analyze this image/video frame. Create a creative, engaging caption suitable for a modern social media gallery. Also generate 3-5 relevant, one-word tags (lowercase).",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: {
              type: Type.STRING,
              description: "A creative caption for the media.",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of relevant tags.",
            },
          },
          required: ["caption", "tags"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as AISuggestion;
      return data;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of error
    return {
      caption: "A beautiful moment captured.",
      tags: ["moments", "gallery"],
    };
  }
};

/**
 * Helper to capture a video frame as base64 for AI analysis
 * Since sending full video files client-side can be heavy/restricted.
 */
export const captureVideoFrame = (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.playsInline = true;
    
    video.onloadeddata = () => {
      // Seek to 1 second or 10% to avoid black frames at start
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64, remove header for Gemini
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Could not create canvas context"));
      }
      URL.revokeObjectURL(video.src);
    };

    video.onerror = (e) => {
      reject(e);
      URL.revokeObjectURL(video.src);
    };
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
