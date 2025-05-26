"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Upload, Settings, Play, Pause, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MusicComponentProps {
  data: {
    type: "upload" | "spotify";
    audioUrl?: string;
    spotifyUrl?: string;
    title?: string;
    artist?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    volume?: number;
    align?: string;
    showArtwork?: boolean;
    backgroundColor?: string;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function MusicComponent({ data, onUpdate, isEditable, isInlineEdit }: MusicComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getSpotifyEmbedUrl = (url: string) => {
    // Convert Spotify URL to embed URL
    const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    const albumMatch = url.match(/album\/([a-zA-Z0-9]+)/);

    if (trackMatch) {
      return `https://open.spotify.com/embed/track/${trackMatch[1]}`;
    } else if (playlistMatch) {
      return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}`;
    } else if (albumMatch) {
      return `https://open.spotify.com/embed/album/${albumMatch[1]}`;
    }
    return null;
  };

  const handleUpdate = (updates: Partial<typeof data>) => {
    if (onUpdate) {
      onUpdate({ ...data, ...updates });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file (MP3, WAV, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a blob URL for the audio file
      const audioUrl = URL.createObjectURL(file);

      handleUpdate({
        type: "upload",
        audioUrl,
        title: data.title || file.name.replace(/\.[^/.]+$/, ""),
      });

      toast({
        title: "Audio uploaded successfully",
        description: "Your audio file is ready to use",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your audio file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  } as any;

  const spotifyEmbedUrl = data.type === "spotify" && data.spotifyUrl ? getSpotifyEmbedUrl(data.spotifyUrl) : null;

  if (!data.audioUrl && !spotifyEmbedUrl && !isEditable) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No audio configured</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`w-full flex ${alignmentClasses[data.align || "center"]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative group w-full max-w-md">
        {data.title && <h3 className="text-lg font-semibold mb-4 text-center">{data.title}</h3>}

        {data.type === "spotify" && spotifyEmbedUrl ? (
          <div className="space-y-4">
            <iframe
              src={spotifyEmbedUrl}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => window.open(data.spotifyUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Spotify
              </Button>
            </div>
          </div>
        ) : data.type === "upload" && data.audioUrl ? (
          <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: data.backgroundColor || "#f8f9fa" }}>
            <div className="flex items-center space-x-4">
              {data.showArtwork && (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <Music className="h-8 w-8 text-white" />
                </div>
              )}

              <div className="flex-1">
                <h4 className="font-medium text-lg">{data.title || "Audio Track"}</h4>
                {data.artist && <p className="text-sm text-muted-foreground">{data.artist}</p>}
              </div>

              <Button variant="ghost" size="sm" onClick={togglePlayPause} className="rounded-full w-12 h-12">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
            </div>

            {data.controls && (
              <div className="mt-4">
                <audio
                  ref={audioRef}
                  src={data.audioUrl}
                  controls
                  autoPlay={data.autoplay}
                  loop={data.loop}
                  className="w-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        ) : isEditable ? (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Add music to your page</p>
              <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure Music
              </Button>
            </div>
          </div>
        ) : null}

        {isEditable && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Music Settings</DialogTitle>
                </DialogHeader>

                <Tabs value={data.type || "upload"} onValueChange={(value) => handleUpdate({ type: value as "upload" | "spotify" })}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                    <TabsTrigger value="spotify">Spotify</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label>Audio File</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept="audio/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex-1">
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Choose File"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="music-title">Title</Label>
                      <Input
                        id="music-title"
                        value={data.title || ""}
                        onChange={(e) => handleUpdate({ title: e.target.value })}
                        placeholder="Song title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="music-artist">Artist</Label>
                      <Input
                        id="music-artist"
                        value={data.artist || ""}
                        onChange={(e) => handleUpdate({ artist: e.target.value })}
                        placeholder="Artist name"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="spotify" className="space-y-4">
                    <div>
                      <Label htmlFor="spotify-url">Spotify URL</Label>
                      <Input
                        id="spotify-url"
                        value={data.spotifyUrl || ""}
                        onChange={(e) => handleUpdate({ spotifyUrl: e.target.value })}
                        placeholder="https://open.spotify.com/track/..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="music-align">Alignment</Label>
                    <Select value={data.align || "center"} onValueChange={(value) => handleUpdate({ align: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-controls">Show Controls</Label>
                      <Switch
                        id="show-controls"
                        checked={data.controls !== false}
                        onCheckedChange={(checked) => handleUpdate({ controls: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-artwork">Show Artwork</Label>
                      <Switch
                        id="show-artwork"
                        checked={data.showArtwork !== false}
                        onCheckedChange={(checked) => handleUpdate({ showArtwork: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="music-autoplay">Autoplay</Label>
                      <Switch
                        id="music-autoplay"
                        checked={data.autoplay || false}
                        onCheckedChange={(checked) => handleUpdate({ autoplay: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="music-loop">Loop</Label>
                      <Switch id="music-loop" checked={data.loop || false} onCheckedChange={(checked) => handleUpdate({ loop: checked })} />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </motion.div>
  );
}
