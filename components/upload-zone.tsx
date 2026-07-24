'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-96 rounded-xl border-2 border-dashed
        transition-all duration-300 cursor-pointer flex items-center justify-center
        ${isDragOver 
          ? 'border-[#7FE7D8] bg-[#171717] scale-105' 
          : 'border-[#262626] bg-[#101010] hover:border-[#5B8CFF]'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={isLoading}
        className="hidden"
        aria-label="Upload image"
      />

      <div className="text-center pointer-events-none">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-[#7FE7D8]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-[#F5F5F2] text-lg font-medium mb-1">Drop Image Here</p>
        <p className="text-[#8A8A8A] text-sm">
          or click to browse from your computer
        </p>
      </div>

      {isDragOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#7FE7D8] opacity-5 rounded-xl pointer-events-none"
        />
      )}
    </motion.div>
  );
}
