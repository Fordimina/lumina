import React, { useRef } from 'react';
import { X, Settings, Save, Activity, Power, Upload, FileCode } from 'lucide-react';
import { AppSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleMaintenance = () => {
    onUpdateSettings({ ...settings, maintenanceMode: !settings.maintenanceMode });
  };

  const updateTitle = (title: string) => {
    onUpdateSettings({ ...settings, galleryTitle: title });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // This triggers the parent (App.tsx) to save this content to Supabase
        onUpdateSettings({ ...settings, aboutHtml: content });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-gradient-to-r from-red-900/20 to-zinc-900 p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-red-400" />
              System Configuration
            </h2>
            <p className="text-sm text-zinc-400">Absolute Admin Access Control</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">General</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Gallery Name</label>
              <input
                type="text"
                value={settings.galleryTitle}
                onChange={(e) => updateTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* About Section Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              About Section Content
            </h3>
            
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-sm text-zinc-300 mb-4">
                Upload an HTML file to update your "About Me" section. Content will be synced to the cloud database.
              </p>
              
              <div className="flex gap-3">
                <input 
                  type="file" 
                  accept=".html,.txt" 
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium border border-zinc-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload HTML File
                </button>
                
                <div className="flex-1 flex items-center text-xs text-zinc-500 italic">
                   Supports raw HTML & inline CSS
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-500">Current Content Preview (Read-only)</label>
              <div className="h-24 bg-black/30 border border-zinc-800 rounded-lg p-2 overflow-hidden">
                <code className="text-xs text-zinc-600 font-mono break-all">
                  {settings.aboutHtml.substring(0, 200)}...
                </code>
              </div>
            </div>
          </div>

          {/* System Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">System Functions</h3>
            
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.maintenanceMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-200">Maintenance Mode</p>
                  <p className="text-xs text-zinc-500">Disable public access to gallery</p>
                </div>
              </div>
              <button 
                onClick={toggleMaintenance}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-yellow-500' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 opacity-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-200">System Shutdown</p>
                  <p className="text-xs text-zinc-500">Emergency stop for all services</p>
                </div>
              </div>
              <button disabled className="px-3 py-1 text-xs bg-zinc-800 text-zinc-500 rounded border border-zinc-700 cursor-not-allowed">
                Disabled
              </button>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end shrink-0 bg-surface">
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;