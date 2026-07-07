"use client";

import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  title: string;
  onEnded?: () => void;
}

export function VideoPlayer({ videoUrl, title, onEnded }: VideoPlayerProps) {
  if (!videoUrl) {
    // Placeholder when no video URL
    return (
      <div className="relative aspect-video bg-bg-card rounded-lg overflow-hidden border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated via-bg-card to-bg-secondary flex flex-col items-center justify-center gap-4">
          {/* Faux code background */}
          <div className="absolute inset-0 opacity-5 font-mono text-xs text-text-primary p-8 leading-relaxed overflow-hidden">
            {`import React from 'react';\n\nexport default function PaymentFlow() {\n  const [status, setStatus] = useState('idle');\n\n  // Initialize the secure payment gateway\n  const handleSubmit = () => {\n    setStatus('processing');\n    api.processPayment().then(() => {\n      setStatus('success');\n    });\n  };\n};`}
          </div>

          <div className="relative z-10 w-20 h-20 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center hover:bg-accent/30 transition-colors cursor-pointer group">
            <Play className="w-8 h-8 text-accent ml-1 group-hover:scale-110 transition-transform" />
          </div>
          <p className="relative z-10 text-sm text-text-muted text-center max-w-xs">
            {title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
        onEnded={onEnded}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
