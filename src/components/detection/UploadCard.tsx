import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Video, AlertCircle, Shield, FileCheck, Sparkles, X, Play, Link, Globe } from 'lucide-react';
import { MediaType } from '../../types/detection';
import { SAMPLE_REAL_IMAGE, SAMPLE_FAKE_IMAGE, SAMPLE_FAKE_VIDEO } from '../../services/sampleData';

interface UploadCardProps {
  onFileSelect: (file: File | { name: string; size: number; type: string; previewUrl: string }, mediaType: MediaType) => void;
  onUrlScan?: (url: string) => void;
  isProcessing: boolean;
}


export const UploadCard: React.FC<UploadCardProps> = ({ onFileSelect, onUrlScan, isProcessing }) => {

  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'url'>('image');
  const [webUrl, setWebUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageFormats = ['image/jpeg', 'image/png', 'image/webp'];
  const videoFormats = ['video/mp4', 'video/quicktime', 'video/webm'];

  const maxImageSizeBytes = 15 * 1024 * 1024; // 15MB
  const maxVideoSizeBytes = 60 * 1024 * 1024; // 60MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);

    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
    const isVid = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);

    if (activeTab === 'image' && !isImage) {
      setErrorMessage('Please upload a valid image file (JPG, JPEG, PNG, WEBP).');
      return;
    }

    if (activeTab === 'video' && !isVid) {
      setErrorMessage('Please upload a valid video file (MP4, MOV, WEBM).');
      return;
    }

    const currentMax = activeTab === 'image' ? maxImageSizeBytes : maxVideoSizeBytes;
    if (file.size > currentMax) {
      setErrorMessage(`File exceeds maximum size of ${activeTab === 'image' ? '15MB' : '60MB'}.`);
      return;
    }

    // Pass validated file
    onFileSelect(file, activeTab === 'video' ? 'video' : 'image');
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!webUrl.trim() || !webUrl.startsWith('http')) {
      setErrorMessage('Please enter a valid HTTP or HTTPS media URL.');
      return;
    }
    if (onUrlScan) {
      onUrlScan(webUrl.trim());
    }
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sampleType: 'real-img' | 'fake-img' | 'fake-vid') => {
    setErrorMessage(null);
    try {
      if (sampleType === 'real-img') {
        setActiveTab('image');
        const res = await fetch('/samples/portrait_sample.jpg');
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], 'authentic_portrait_sample.jpg', { type: 'image/jpeg' });
          onFileSelect(file, 'image');
          return;
        }
      } else if (sampleType === 'fake-img') {
        setActiveTab('image');
        const res = await fetch('/samples/fake_sample.jpg');
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], 'synthetic_deepfake_sample.jpg', { type: 'image/jpeg' });
          onFileSelect(file, 'image');
          return;
        }
      }
    } catch (e) {
      console.warn('Sample fetch fallback:', e);
    }

    // Fallback if fetch is unavailable
    if (sampleType === 'real-img') {
      setActiveTab('image');
      onFileSelect({
        name: SAMPLE_REAL_IMAGE.filename,
        size: SAMPLE_REAL_IMAGE.fileSizeBytes,
        type: 'image/jpeg',
        previewUrl: '/samples/portrait_sample.jpg',
      }, 'image');
    } else if (sampleType === 'fake-img') {
      setActiveTab('image');
      onFileSelect({
        name: SAMPLE_FAKE_IMAGE.filename,
        size: SAMPLE_FAKE_IMAGE.fileSizeBytes,
        type: 'image/jpeg',
        previewUrl: '/samples/fake_sample.jpg',
      }, 'image');
    } else if (sampleType === 'fake-vid') {
      setActiveTab('video');
      onFileSelect({
        name: SAMPLE_FAKE_VIDEO.filename,
        size: SAMPLE_FAKE_VIDEO.fileSizeBytes,
        type: 'video/mp4',
        previewUrl: SAMPLE_FAKE_VIDEO.previewUrl,
      }, 'video');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl glass-panel p-6 sm:p-10 shadow-soft-xl border border-white relative">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-guard-navy tracking-tight">
          Upload Media for Analysis
        </h2>
        <p className="text-sm text-guard-muted mt-2">
          Submit photos or video recordings for deep forensic evaluation using Vision Transformer attention maps.
        </p>
      </div>

      {/* Tabs: Image / Video / URL */}
      <div className="flex items-center justify-center mb-6">
        <div className="p-1.5 rounded-2xl bg-white border border-guard-border/80 shadow-sm flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('image'); setErrorMessage(null); }}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'image'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image File
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('video'); setErrorMessage(null); }}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'video'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Video className="w-4 h-4" />
            Video File
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'url'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            Scan Web URL
          </button>
        </div>
      </div>

      {/* URL Scanner Form or Drag & Drop Zone */}
      {activeTab === 'url' ? (
        <form
          onSubmit={handleUrlSubmit}
          className="border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center bg-white/70 shadow-sm"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pastel-blue/50 via-pastel-cyan/40 to-pastel-yellow/30 mx-auto flex items-center justify-center text-guard-navy shadow-sm mb-4">
            <Link className="w-8 h-8 text-guard-navy stroke-[1.8]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-guard-navy">
            Inspect Remote Image or Video URL
          </h3>
          <p className="text-xs text-guard-muted mt-1 max-w-sm mx-auto">
            DeepGuard AI will securely fetch the remote media stream and run multi-layer forensic detection.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="url"
              placeholder="https://example.com/target-face.jpg"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl border border-guard-border text-xs text-guard-navy focus:outline-none focus:ring-2 focus:ring-guard-navy/20 bg-white"
            />
            <button
              type="submit"
              disabled={isProcessing || !webUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-guard-navy hover:bg-guard-slate disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-pastel-yellow" />
              Scan URL
            </button>
          </div>
        </form>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer group ${
            isDragOver
              ? 'border-pastel-rose bg-pastel-blush/20 scale-[1.01]'
              : 'border-slate-300 hover:border-pastel-blue bg-white/60 hover:bg-white/90'
          } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={activeTab === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/quicktime,video/webm'}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pastel-cyan/50 via-pastel-blue/40 to-pastel-yellow/30 mx-auto flex items-center justify-center text-guard-navy shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8 text-guard-navy stroke-[1.8]" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-guard-navy mt-5">
            Drop your {activeTab} here
          </h3>
          <p className="text-xs text-guard-muted mt-1">
            or <span className="font-semibold text-pastel-rose underline underline-offset-2">click to browse</span> from your computer
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100/90 text-guard-slate border border-slate-200">
              {activeTab === 'image' ? 'Formats: JPG, JPEG, PNG, WEBP' : 'Formats: MP4, MOV, WEBM'}
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100/90 text-guard-slate border border-slate-200">
              {activeTab === 'image' ? 'Max: 15 MB' : 'Max: 60 MB'}
            </span>
          </div>
        </div>
      )}


      {/* Error Message if any */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-2xl bg-detect-fake-bg border border-detect-fake-border flex items-center justify-between text-detect-fake text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-detect-fake hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Sample Selector for Instant Testing */}
      <div className="mt-6 pt-6 border-t border-guard-border/80">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <span className="text-xs font-bold text-guard-navy flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pastel-rose" />
            Quick Demo Samples (1-Click Evaluation):
          </span>
          <span className="text-[11px] text-guard-muted">No download required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleSelectSample('real-img')}
            disabled={isProcessing}
            className="p-3 rounded-2xl bg-white border border-guard-border hover:border-detect-real hover:bg-detect-real-bg/20 text-left transition-all group flex items-center gap-3 shadow-xs"
          >
            <img 
              src="/samples/portrait_sample.jpg" 
              alt="Real Face Sample" 
              className="w-12 h-12 rounded-xl object-cover border border-guard-border group-hover:scale-105 transition-transform" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-guard-navy group-hover:text-detect-real truncate">Real Photo</span>
                <span className="text-[10px] font-bold text-detect-real bg-detect-real-bg px-1.5 py-0.5 rounded">REAL</span>
              </div>
              <p className="text-[10px] text-guard-muted truncate">Natural skin & cornea</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('fake-img')}
            disabled={isProcessing}
            className="p-3 rounded-2xl bg-white border border-guard-border hover:border-detect-fake hover:bg-detect-fake-bg/20 text-left transition-all group flex items-center gap-3 shadow-xs"
          >
            <img 
              src="/samples/fake_sample.jpg" 
              alt="Fake Face Sample" 
              className="w-12 h-12 rounded-xl object-cover border border-guard-border group-hover:scale-105 transition-transform" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-guard-navy group-hover:text-detect-fake truncate">Deepfake AI</span>
                <span className="text-[10px] font-bold text-detect-fake bg-detect-fake-bg px-1.5 py-0.5 rounded">FAKE</span>
              </div>
              <p className="text-[10px] text-guard-muted truncate">Synthetic boundary</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('fake-vid')}
            disabled={isProcessing}
            className="p-3 rounded-2xl bg-white border border-guard-border hover:border-detect-fake hover:bg-detect-fake-bg/20 text-left transition-all group flex items-center gap-3 shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-pastel-blush/60 border border-guard-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-guard-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-guard-navy group-hover:text-detect-fake truncate">Video Test</span>
                <span className="text-[10px] font-bold text-detect-fake bg-detect-fake-bg px-1.5 py-0.5 rounded">VIDEO</span>
              </div>
              <p className="text-[10px] text-guard-muted truncate">120 frames timeline</p>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-guard-muted">
        <Shield className="w-3.5 h-3.5 text-detect-real" />
        <span>Your uploaded media is processed securely in isolated memory and never permanently stored.</span>
      </div>

    </div>
  );
};
