import React, { useState, useMemo, useEffect, useCallback } from "react";
import Header from "./components/Header";
import MediaCard from "./components/MediaCard";
import UploadModal from "./components/UploadModal";
import LoginModal from "./components/LoginModal";
import AdminPanel from "./components/AdminPanel";
import Lightbox from "./components/Lightbox";
import AboutSection from "./components/AboutSection";

import {
  MediaItem,
  UserRole,
  AppSettings,
  PendingUpload,
  UploadStatus,
} from "./types";

import {
  Plus,
  Settings as SettingsIcon,
  Lock,
  Shuffle,
  Clock,
  Info,
  CloudOff,
} from "lucide-react";

import {
  fetchPosts,
  deletePost,
  createPost,
  fetchSettings,
  saveSettings,
  uploadFileToStorage,
} from "./services/supabaseClient";

import {
  getAllPendingUploads,
  removePendingUpload,
} from "./utils/uploadQueue";

// Default HTML for the About section to show users what is possible
const DEFAULT_ABOUT_HTML = `
  <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
    <div class="flex-1">
      <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Welcome to My World</h2>
      <p class="text-lg text-zinc-300 mb-4 leading-relaxed">
        I am a passionate digital creator specializing in capturing moments that tell a story.
        From the urban sprawl to nature's quietest corners, I seek the beauty in everything.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 class="text-white font-semibold mb-2">Photography</h3>
          <p class="text-sm text-zinc-400">5+ years experience with Sony Alpha systems, focusing on street and portrait photography.</p>
        </div>
        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 class="text-white font-semibold mb-2">Videography</h3>
          <p class="text-sm text-zinc-400">Professional drone operator and editor using DaVinci Resolve.</p>
        </div>
      </div>
    </div>
  </div>
`;

// Fallback seed data in case database is empty or not connected
const INITIAL_DATA: MediaItem[] = [
  {
    id: "1",
    type: "image",
    url: "https://picsum.photos/id/1015/800/600",
    caption: "River valleys and sunset dreams.",
    tags: ["nature", "landscape", "river"],
    timestamp: Date.now() - 10000000,
    author: "Admin",
  },
  {
    id: "2",
    type: "video",
    url: "https://videos.pexels.com/video-files/855029/855029-sd_640_360_30fps.mp4",
    caption: "Urban exploration via drone footage.",
    tags: ["video", "drone", "city"],
    timestamp: Date.now() - 5000000,
    author: "Admin",
  },
];

const App: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting State
  const [sortMode, setSortMode] = useState<"RECENT" | "RANDOM">("RECENT");
  const [randomSeed, setRandomSeed] = useState(0); // Used to trigger re-shuffle

  // Authentication State
  const [userRole, setUserRole] = useState<UserRole>("GUEST");
  const [username, setUsername] = useState<string>("");

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // View States
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Lightbox State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // App Settings (Hybrid: some local, some from DB)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem("lumina_settings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          galleryTitle: "Lumina Gallery",
          maintenanceMode: false,
          allowPublicComments: true,
          aboutHtml: DEFAULT_ABOUT_HTML,
        };
  });

  // -----------------------------
  // Offline Upload Queue Handling
  // -----------------------------
  const [pendingUploads, setPendingUploads] = useState<
    (PendingUpload & { status: UploadStatus; error?: string })[]
  >([]);

  // Load pending uploads from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const stored = await getAllPendingUploads();
      setPendingUploads(
        stored.map((u) => ({ ...u, status: "pending" as UploadStatus }))
      );
    })();
  }, []);

  const processPendingUploads = useCallback(
    async (uploads = pendingUploads) => {
      if (!navigator.onLine) return;

      // Mark "pending" or "failed" as "uploading"
      setPendingUploads((prev) =>
        prev.map((item) =>
          item.status === "pending" || item.status === "failed"
            ? { ...item, status: "uploading", error: undefined }
            : item
        )
      );

      for (const item of uploads) {
        if (item.status === "completed") continue;

        try {
          const url = await uploadFileToStorage(item.file);

          // Caption style C: user title + " — " + description/AI caption (if present)
          const combinedCaption = item.meta.description
            ? `${item.meta.title} — ${item.meta.description}`
            : item.meta.title;

          const newMedia: MediaItem = {
            id: crypto.randomUUID(),
            type: item.meta.mediaType,
            url,
            caption: combinedCaption,
            tags: item.meta.tags,
            timestamp: Date.now(),
            author: "OfflineUpload",
          };

          await createPost(newMedia);

          // Add to gallery
          setMediaItems((prev) => [newMedia, ...prev]);

          // Remove from IndexedDB + local state
          await removePendingUpload(item.id);
          setPendingUploads((prev) => prev.filter((u) => u.id !== item.id));
        } catch (err) {
          console.error("Failed to process pending upload", err);
          setPendingUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: "failed",
                    error: "Upload failed. Will retry when online.",
                  }
                : u
            )
          );
        }
      }
    },
    [pendingUploads]
  );

  // Auto-retry queued uploads when we come back online
  useEffect(() => {
    const handler = () => processPendingUploads();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [processPendingUploads]);

  // Load Data from Supabase on Mount
  useEffect(() => {
    const loadContent = async () => {
      setIsLoadingData(true);
      try {
        // 1. Fetch Posts
        const posts = await fetchPosts();
        if (posts && posts.length > 0) {
          setMediaItems(posts);
        } else {
          // Fallback if DB is empty or not set up yet
          setMediaItems(INITIAL_DATA);
        }

        // 2. Fetch About HTML
        const remoteAbout = await fetchSettings();
        if (remoteAbout) {
          setAppSettings((prev) => ({ ...prev, aboutHtml: remoteAbout }));
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
        setMediaItems(INITIAL_DATA); // Fail safe
      } finally {
        setIsLoadingData(false);
      }
    };
    loadContent();
  }, []);

  // Persist settings locally
  useEffect(() => {
    localStorage.setItem("lumina_settings", JSON.stringify(appSettings));
  }, [appSettings]);

  // Save About HTML to DB when it changes
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    if (newSettings.aboutHtml !== appSettings.aboutHtml) {
      try {
        await saveSettings(newSettings.aboutHtml);
      } catch (e) {
        console.error("Failed to save about section to cloud", e);
        alert(
          "Saved locally, but failed to sync to cloud. Check your connection."
        );
      }
    }
  };

  // Filter and Sort items
  const displayItems = useMemo(() => {
    let items = [...mediaItems];

    // Filter
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.caption.toLowerCase().includes(lowerTerm) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lowerTerm))
      );
    }

    // Sort
    if (sortMode === "RECENT") {
      items.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      const seed = randomSeed + items.length;
      items = items.sort(
        () => Math.sin(seed + Math.random()) - 0.5
      );
    }

    return items;
  }, [mediaItems, searchTerm, sortMode, randomSeed]);

  const handleUpload = async (newItem: MediaItem) => {
    // Optimistic UI update
    setMediaItems((prev) => [newItem, ...prev]);

    try {
      await createPost(newItem);
    } catch (e) {
      console.error("Failed to save post to cloud", e);
      alert(
        "Upload failed to save to database. Please check your configuration."
      );
      setMediaItems((prev) => prev.filter((i) => i.id !== newItem.id)); // Revert
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      // Optimistic UI update
      const previousItems = [...mediaItems];
      setMediaItems((prev) => prev.filter((item) => item.id !== id));

      try {
        await deletePost(id);
      } catch (e) {
        console.error("Failed to delete", e);
        alert("Could not delete from cloud.");
        setMediaItems(previousItems); // Revert
      }
    }
  };

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUsername(name);
  };

  const handleLogout = () => {
    setUserRole("GUEST");
    setUsername("");
    setIsUploadModalOpen(false);
    setIsAdminPanelOpen(false);
  };

  const handleSortChange = (mode: "RECENT" | "RANDOM") => {
    if (mode === "RANDOM" && sortMode === "RANDOM") {
      setRandomSeed((prev) => prev + 1);
    }
    setSortMode(mode);
  };

  const isMaintenanceActive =
    appSettings.maintenanceMode && userRole !== "ADMIN";

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans pb-24">
      <Header
        title={appSettings.galleryTitle}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userRole={userRole}
        username={username}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-6rem)]">
        {isMaintenanceActive ? (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
            <div className="bg-yellow-500/10 p-6 rounded-full mb-6 border border-yellow-500/20">
              <Lock className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Maintenance Mode
            </h2>
            <p className="text-zinc-400 max-w-md text-center">
              The gallery is currently undergoing scheduled maintenance. Please
              check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 mb-8 animate-fade-in">
              <button
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  isAboutOpen
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <Info className="w-4 h-4" />
                About Me
              </button>

              <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>

              <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-full shadow-sm">
                <button
                  onClick={() => handleSortChange("RECENT")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sortMode === "RECENT"
                      ? "bg-zinc-800 text-white shadow"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Recent
                </button>
                <button
                  onClick={() => handleSortChange("RANDOM")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sortMode === "RANDOM"
                      ? "bg-zinc-800 text-white shadow"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                  Random
                </button>
              </div>
            </div>

            {/* About Section */}
            <AboutSection
              isOpen={isAboutOpen}
              htmlContent={appSettings.aboutHtml}
            />

            {/* Loading State */}
            {isLoadingData && (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingData && displayItems.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 text-zinc-500 animate-fade-in">
                <CloudOff className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No memories found.</p>
                <p className="text-sm max-w-xs text-center mt-2">
                  Try uploading something or check your database connection.
                </p>
              </div>
            )}

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 animate-fade-in pb-20">
              {displayItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  userRole={userRole}
                  onDelete={handleDelete}
                  onPreview={setSelectedMedia}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Pending Uploads Bubble */}
      {pendingUploads.length > 0 && (
        <div className="fixed bottom-24 right-4 max-w-sm bg-surface/90 border border-zinc-700 rounded-xl p-3 shadow-lg backdrop-blur animate-slide-up z-40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary">
              Pending uploads ({pendingUploads.length})
            </span>
            <button
              className="text-xs text-primary underline disabled:text-zinc-600"
              onClick={() => processPendingUploads()}
              disabled={!navigator.onLine}
            >
              Retry
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {pendingUploads.map((item) => (
              <div key={item.id} className="flex flex-col gap-0.5 text-xs">
                <span className="font-medium truncate">
                  {item.meta.title}
                </span>
                <span className="text-[10px] text-secondary">
                  {item.status === "pending" && "Waiting for connection"}
                  {item.status === "uploading" && "Uploading..."}
                  {item.status === "failed" &&
                    (item.error ?? "Upload failed")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-30 flex flex-col gap-4 items-end pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-4">
          {/* Admin Panel Button */}
          {userRole === "ADMIN" && (
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700 shadow-xl transition-all"
                title="Admin Panel"
              >
                <SettingsIcon className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          {(userRole === "ADMIN" || userRole === "MODERATOR") && (
            <div className="animate-slide-up">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="relative flex items-center gap-2 bg-black text-white px-6 py-4 rounded-full hover:bg-zinc-900 transition-all shadow-2xl"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold pr-1">Upload</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        username={username}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
      />

      <Lightbox item={selectedMedia} onClose={() => setSelectedMedia(null)} />
    </div>
  );
};

export default App;
