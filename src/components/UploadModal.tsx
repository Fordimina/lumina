import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Sparkles, Image as ImageIcon, Film, Tag, Play } from 'lucide-react';
import { analyzeMedia, fileToBase64, captureVideoFrame } from '../services/geminiService';
import { uploadFileToStorage } from '../services/supabaseClient';
import { MediaItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (item: MediaItem) => Promise<void>;
  username: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, username }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setCaption('');
    setTags('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleMagicFill = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      let base64 = '';
      let mimeType = file.type;

      if (file.type.startsWith('video/')) {
        base64 = await captureVideoFrame(file);
        mimeType = 'image/jpeg';
      } else {
        base64 = await fileToBase64(file);
      }

      const suggestion = await analyzeMedia(base64, mimeType);
      setCaption(suggestion.caption);
      setTags(suggestion.tags.join(', '));
    } catch (error) {
      console.error("Analysis failed", error);
      alert("AI analysis failed. Please try again or enter details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload actual file to Cloud Storage
      const cloudUrl = await uploadFileToStorage(file);

      // 2. Create Media Item object
      const newItem: MediaItem = {
        id: crypto.randomUUID(),
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: cloudUrl, // Uses the Cloud URL now
        caption: caption || 'Untitled',
        tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        timestamp: Date.now(),
        author: username
      };

      // 3. Save to Database
      await onUpload(newItem);
      
      // 4. Cleanup
      onClose();
      setTimeout(() => {
        setFile(null);
        setPreviewUrl(null);
        setCaption('');
        setTags('');
      }, 300);
    } catch (error: any) {
      console.error("Upload failed", error);
      if (error.message && error.message.includes("Storage is not configured")) {
        alert("Upload failed: Cloud storage is not configured. Please set up Supabase credentials.");
      } else {
        alert(`Failed to upload file: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-surface border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Media</h2>
            <p className="text-sm text-zinc-400">Share photos or videos</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          <div 
            className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
            } ${previewUrl ? 'p-0 border-none overflow-hidden bg-black' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
             <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="relative w-full">
                {file?.type.startsWith('video') ? (
                  <div className="relative w-full h-64 bg-black flex items-center justify-center">
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-contain" 
                      controls 
                      autoPlay 
                      muted
                      playsInline
                    />
                  </div>
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain bg-black" />
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-8">
                <div className="flex justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                   <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform delay-75">
                    <Film className="w-8 h-8 text-zinc-400" />
                  </div>
                </div>
                <p className="text-zinc-200 font-medium">Click to upload or drag and drop</p>
                <p className="text-zinc-500 text-sm mt-1">Supports Images & Videos (MP4, WebM)</p>
              </div>
            )}
          </div>

          {file && (
             <button
              onClick={handleMagicFill}
              disabled={isAnalyzing || isUploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-Generate Caption & Tags
                </>
              )}
            </button>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Caption</label>
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a catchy caption..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Tags (comma separated)</label>
              <div className="relative">
                <Tag className="absolute top-3 left-3 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="nature, travel, photography"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="px-6 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Publish'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadModal;