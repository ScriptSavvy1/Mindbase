"use client";

import { useState, useRef } from "react";
import { Upload, X, File, Image as ImageIcon, Film } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  label?: string;
  type?: "image" | "video";
  onFileSelect: (file: File) => void;
  currentUrl?: string | null;
  className?: string;
}

export function FileUpload({
  accept = "image/*",
  label = "Upload file",
  type = "image",
  onFileSelect,
  currentUrl,
  className = "",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onFileSelect(file);
    setFileName(file.name);
    if (type === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {preview && type === "image" ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-1 bg-bg-primary/80 rounded-full hover:bg-error/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-error" />
          </button>
        </div>
      ) : fileName ? (
        <div className="flex items-center gap-3 p-3 bg-bg-elevated border border-border rounded-lg">
          {type === "video" ? (
            <Film className="w-5 h-5 text-accent" />
          ) : (
            <File className="w-5 h-5 text-accent" />
          )}
          <span className="text-sm text-text-primary truncate flex-1">
            {fileName}
          </span>
          <button
            onClick={clearFile}
            className="p-1 hover:bg-error/10 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-muted hover:text-error" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            dragActive
              ? "border-accent bg-accent/5"
              : "border-border hover:border-border-hover hover:bg-bg-hover"
          }`}
        >
          {type === "image" ? (
            <ImageIcon className="w-8 h-8 text-text-muted" />
          ) : (
            <Upload className="w-8 h-8 text-text-muted" />
          )}
          <div className="text-center">
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="text-xs text-text-muted mt-1">
              Drag and drop or click to browse
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
