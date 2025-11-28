import React, { useState } from 'react';
import { Play, Image as ImageIcon, Trash2, Clock, Loader2, Maximize2 } from 'lucide-react';
import { MediaItem, UserRole } from '../types';
import VideoPlayer from './VideoPlayer';

interface MediaCardProps {
  item: MediaItem;
  userRole: UserRole;
  onDelete: (id: string) => void;
  onPreview: (item: MediaItem) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, userRole, onDelete, onPreview }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Crucial: Prevents bubbling to any parent handlers
    onDelete(item.id);
  };

  const handlePreviewClick = () => {
    onPreview(item);
  };

  return (
    <div className="break-inside-avoid mb-6 relative group">
      <div 
        className="rounded-xl bg-zinc-900 shadow-xl border border-zinc-800 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-zinc-700"
      >
        
        {/* Media Container */}
        <div className="relative w-full bg-zinc-900">
          
          {/* Loading Spinner (only relevant if we are tracking load state for images or non-started videos) */}
          {!isLoaded && item.type === 'image' && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <Loader2 className="w-8 h-8 text-zinc-700 animate-spin" />
            </div>
          )}

          {item.type === 'video' ? (
            <div className="relative w-full">
               <VideoPlayer 
                  src={item.url} 
                  onPreview={handlePreviewClick}
               />
            </div>
          ) : (
            <div className="relative cursor-pointer" onClick={handlePreviewClick}>
              <img 
                src={item.url} 
                alt={item.caption} 
                className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
              />
              
              {/* Overlay Gradient for Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Hover Action Icon for Image */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md p-3 rounded-full text-white transform scale-90 group-hover:scale-100 transition-transform">
                  <Maximize2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Type Indicator Badge */}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white/90 p-1.5 rounded-full border border-white/10 pointer-events-none z-10">
             {item.type === 'video' ? <Play className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 bg-surface relative z-10 border-t border-zinc-800">
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-sm font-medium text-zinc-200 line-clamp-2 leading-relaxed cursor-pointer hover:text-blue-400 transition-colors" onClick={handlePreviewClick}>
              {item.caption}
             </h3>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-500 font-medium pt-3 border-t border-zinc-800/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="text-zinc-600">
              By {item.author}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Button */}
{userRole !== 'GUEST' && (
  <button
    onClick={handleDeleteClick}
    className="absolute top-[-10px] left-[-10px] z-50 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 hover:scale-110"
    title="Delete Post"
  >
    <Trash2 className="w-4 h-4" />
  </button>
)}

/* Edit Button */
{userRole !== 'GUEST' && onEdit && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onEdit(item);
    }}
    className="absolute top-[-10px] right-[-10px] z-50 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 hover:scale-110"
    title="Edit Post"
  >
    ✎
  </button>
)}
    </div>
  );
};

export default MediaCard;
