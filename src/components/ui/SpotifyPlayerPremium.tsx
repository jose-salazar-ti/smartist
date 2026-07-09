"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import { toast } from "sonner";

interface SpotifyPlayerPremiumProps {
  spotifyUri: string | null;
  autoPlay?: boolean;
}

export function SpotifyPlayerPremium({ spotifyUri, autoPlay = false }: SpotifyPlayerPremiumProps) {
  const [songDetails, setSongDetails] = useState<{
    title: string;
    artist: string;
    image: string;
  } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Previews are typically 30 seconds
  const [loading, setLoading] = useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Auto-play trigger once audioUrl is ready
  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Autoplay blocked by browser policy, waiting for user click.", err);
        });
    }
  }, [audioUrl, autoPlay]);

  // 1. Fetch Details & Set URLs based on audio source type
  useEffect(() => {
    if (!spotifyUri) return;

    if (spotifyUri.startsWith("upload:")) {
      const directUrl = spotifyUri.substring(7);
      setSongDetails({
        title: "Audio Personalizado 🎙️",
        artist: "De parte de tu persona especial",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80"
      });
      setAudioUrl(directUrl);
      return;
    }

    const trackId = spotifyUri.split(":")[2] || spotifyUri;
    if (!trackId) return;

    setLoading(true);
    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          const rawTitle = data.title; // e.g. "Perfect - song by Ed Sheeran"
          let parsedTitle = rawTitle;
          let parsedArtist = data.author_name || "Spotify Artist";

          if (rawTitle.includes(" - song by ")) {
            const parts = rawTitle.split(" - song by ");
            parsedTitle = parts[0];
            parsedArtist = parts[1];
          } else if (rawTitle.includes(" - song and lyrics by ")) {
            const parts = rawTitle.split(" - song and lyrics by ");
            parsedTitle = parts[0];
            parsedArtist = parts[1];
          } else if (rawTitle.includes(" - song ")) {
            const parts = rawTitle.split(" - song ");
            parsedTitle = parts[0];
            parsedArtist = parts[1];
          }

          setSongDetails({
            title: parsedTitle,
            artist: parsedArtist,
            image: data.thumbnail_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80"
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching Spotify oembed:", err);
        setSongDetails({
          title: "Perfect",
          artist: "Ed Sheeran",
          image: "https://i.scdn.co/image/ab67616d0000b2735165c719e7cf840003b0c818" 
        });
      })
      .finally(() => setLoading(false));
  }, [spotifyUri]);

  // 2. Query iTunes API using Title & Artist to get the preview MP3 URL
  useEffect(() => {
    if (!songDetails || (spotifyUri && spotifyUri.startsWith("upload:"))) return;
    const query = encodeURIComponent(`${songDetails.artist} ${songDetails.title}`);
    
    fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        const track = data.results?.[0];
        if (track && track.previewUrl) {
          setAudioUrl(track.previewUrl);
        }
      })
      .catch((err) => {
        console.error("Error searching iTunes API:", err);
      });
  }, [songDetails]);

  // 3. Setup HTML5 Audio element
  useEffect(() => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 30);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  // 4. Trigger Play/Pause directly on Click (Crucial for iOS Safari & Android Chrome autoplay bypass)
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback blocked/failed on mobile:", err);
          toast.error("Presiona play de nuevo para iniciar el audio");
        });
    }
  };

  if (!spotifyUri) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const title = songDetails?.title || "Perfect";
  const artist = songDetails?.artist || "Ed Sheeran";
  const image = songDetails?.image || "https://i.scdn.co/image/ab67616d0000b2735165c719e7cf840003b0c818";

  return (
    <div className="w-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 p-4 rounded-3xl text-white shadow-xl shadow-fuchsia-900/20 select-none">
      
      {/* Upper section: Track info */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="w-12 h-12 rounded-xl bg-white/25 animate-pulse flex items-center justify-center">
            <span className="text-[10px] opacity-50">...</span>
          </div>
        ) : (
          <img 
            src={image} 
            alt={title} 
            className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate leading-snug">{title}</p>
          <p className="text-[10px] text-white/80 truncate leading-normal">{artist}</p>
        </div>
        <a 
          href={`https://open.spotify.com/track/${spotifyUri.split(":")[2]}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform p-1 bg-white/10 rounded-full shrink-0 flex items-center justify-center border border-white/10"
          title="Abrir en Spotify"
        >
          <img 
            src="/images/spotify-white.png" 
            alt="Spotify" 
            className="h-4.5 w-4.5 object-contain" 
            onError={(e) => {
              // Fallback if local image doesn't exist
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </a>
      </div>

      {/* Middle section: Progress bar */}
      <div className="mt-3 space-y-1">
        <div 
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const percentage = clickX / width;
            const newTime = percentage * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            setProgress(percentage * 100);
          }}
          className="relative w-full h-1 bg-white/35 rounded-full overflow-hidden cursor-pointer"
        >
          <div 
            className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-300 pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] opacity-80 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Bottom section: Playback Controls */}
      <div className="flex items-center justify-between px-2 mt-1">
        <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
          <Shuffle className="w-3.5 h-3.5" />
        </button>
        <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
          <SkipBack className="w-4 h-4" />
        </button>
        
        {/* Play/Pause Circle Button */}
        <button 
          onClick={handleTogglePlay}
          className="w-8 h-8 rounded-full bg-white text-purple-700 flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current text-purple-700" />
          ) : (
            <Play className="w-4 h-4 fill-current translate-x-[1px] text-purple-700" />
          )}
        </button>

        <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
          <SkipForward className="w-4 h-4" />
        </button>
        <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
          <Repeat className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-center mt-2.5 pt-2 border-t border-white/10">
        <a 
          href={`https://open.spotify.com/track/${spotifyUri.split(":")[2]}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[9px] text-white/90 hover:text-white hover:underline font-semibold tracking-wide flex items-center justify-center gap-1 cursor-pointer"
        >
          Escuchar canción completa en Spotify 🎧
        </a>
      </div>
    </div>
  );
}
