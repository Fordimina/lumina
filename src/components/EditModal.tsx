import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { MediaItem } from "../types";
import { updatePost } from "../services/posts";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem | null;
  onUpdated: (updated: MediaItem) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, item, onUpdated }) => {
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  // Load item when modal opens
  useEffect(() => {
    if (item) {
      setCaption(item.caption);
      setTags(item.tags.join(", "));
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    setLoading(true);

    const fields = {
      caption,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      await updatePost(item.id, fields);

      const updatedItem: MediaItem = {
        ...item,
        caption: fields.caption,
        tags: fields.tags,
      };

      onUpdated(updatedItem);
      onClose();
    } catch (e) {
      console.error("Failed to update post:", e);
      alert("Failed to update post. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-zinc-900 w-full max-w-lg rounded-xl border border-zinc-700 shadow-xl p-6 relative animate-slide-up">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-white">
          Edit Post
        </h2>

        {/* Caption */}
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Caption
        </label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-600 mb-4"
        />

        {/* Tags */}
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Tags (comma-separated)
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-600 mb-6"
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditModal;
