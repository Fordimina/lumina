import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MediaItem } from '../types';

interface LightboxProps {
  item: MediaItem | null;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ item, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50 backdrop-blur-sm"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center p-2" 
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
          {item.type === 'video' ? (
            <video 
              src={item.url} 
              controls 
              autoPlay 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          ) : (
            <img 
              src={item.url} 
              alt={item.caption} 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          )}
        </div>
        
        <div className="mt-6 max-w-2xl text-center">
          <h3 className="text-xl font-medium text-white mb-2">{item.caption}</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="text-sm text-zinc-400">#{tag}</span>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-2 uppercase tracking-widest">
            Posted by {item.author} • {new Date(item.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;