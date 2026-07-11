'use client';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

export function VideoPlayer({ videoUrl, posterUrl }: VideoPlayerProps) {
  if (!videoUrl) return null;

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-border">
      <video
        controls
        preload="metadata"
        poster={posterUrl}
        className="w-full h-full"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
