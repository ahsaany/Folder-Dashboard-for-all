import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  School, 
  Sparkles, 
  FileCheck
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface BrandingSettingsModalProps {
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  customLogo: string | null;
  onUpdateCustomLogo: (logoDataUrl: string | null) => void;
  onClose: () => void;
}

export const BrandingSettingsModal: React.FC<BrandingSettingsModalProps> = ({
  schoolName,
  onUpdateSchoolName,
  customLogo,
  onUpdateCustomLogo,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState<string>(schoolName);
  const [previewLogo, setPreviewLogo] = useState<string | null>(customLogo);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewLogo(result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultLogo = () => {
    setPreviewLogo(null);
  };

  const handleResetToDefaultName = () => {
    setNameInput('Nada International School');
  };

  const handleSave = () => {
    const trimmed = nameInput.trim() || 'Nada International School';
    onUpdateSchoolName(trimmed);
    onUpdateCustomLogo(previewLogo);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                School Branding & Identity Settings
              </h3>
              <p className="text-xs text-slate-500">
                Customize institution name and replace school emblem logo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
          
          {/* Field 1: School Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Institution / School Name
              </label>
              <button
                type="button"
                onClick={handleResetToDefaultName}
                className="text-[11px] text-emerald-700 hover:underline font-medium"
              >
                Reset to Default
              </button>
            </div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Nada International School"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-semibold text-slate-900"
            />
            <p className="text-[11px] text-slate-500">
              This name will appear on the header, main dashboard hero banner, and exported reports.
            </p>
          </div>

          {/* Field 2: Replace School Logo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                School Emblem Logo
              </label>
              {previewLogo && (
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="text-[11px] text-rose-600 hover:underline font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Official NIS Logo</span>
                </button>
              )}
            </div>

            {/* Logo Preview Box */}
            <div className="flex items-center gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex flex-col items-center gap-1.5">
                <SchoolLogo size={56} customLogo={previewLogo} />
                <span className="text-[10px] text-slate-400 font-mono">Emblem</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="text-xs">
                  <span className="font-bold text-slate-800">
                    {previewLogo ? 'Custom Logo Uploaded' : 'Default Official NIS Emblem'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Recommended: PNG or SVG with transparent background for best display on Windows 11 Fluent panels.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload New Logo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Offline Persistence Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your customized school name and logo are stored locally in your browser and will persist across sessions without requiring any internet connection.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
