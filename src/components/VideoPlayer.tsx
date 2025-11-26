import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize2, RotateCw } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onPreview?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, onPreview }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = (speed: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    video.currentTime = percentage * video.duration;
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) onPreview();
  };

  return (
    <div 
      className="relative w-full h-full bg-black group/player"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        poster={poster}
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Center Play Button (Only visible when paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
          onClick={togglePlay}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white pl-1" />
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-2 transition-opacity duration-300 flex flex-col gap-2 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer overflow-hidden group/progress"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover/progress:opacity-100" />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            
            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className="flex items-center gap-0.5 text-xs font-medium text-white hover:text-blue-400 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>{playbackRate}x</span>
              </button>

              {/* Speed Menu Dropup */}
              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden flex flex-col w-20 z-20">
                  {[0.5, 1, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={(e) => changeSpeed(rate, e)}
                      className={`px-3 py-1.5 text-xs text-left hover:bg-zinc-700 ${playbackRate === rate ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handlePreviewClick} 
            className="text-white/70 hover:text-white transition-colors"
            title="Fullscreen Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;