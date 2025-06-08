"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, X, Search, Trash2, Music, Grid3X3, List, Check, Plus, FileAudio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { uploadMusic, getUserMusic, deleteMusic, type UploadedMusic } from "@/lib/firebase/storage-service";

interface MusicTrack {
  id: string;
  type: "upload" | "spotify";
  audioUrl: string;
  spotifyUrl: string;
  title: string;
  artist: string;
  fileName?: string;
  size?: number;
  uploadedAt?: Date;
}

interface MusicGalleryProps {
  onSelectTracks: (tracks: MusicTrack[]) => void;
  onClose: () => void;
  isOpen: boolean;
  maxTracks?: number;
}

export function MusicGallery({ onSelectTracks, onClose, isOpen, maxTracks = 3 }: MusicGalleryProps) {
  const { toast } = useToast();
  const { user } = useFirebase();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("library");
  const [isLoading, setIsLoading] = useState(false);

  // Load music from Firebase when component opens
  const loadMusicFromFirebase = useCallback(async () => {
    if (!user || !isOpen) return;

    setIsLoading(true);
    try {
      // Only load uploaded music, remove Spotify functionality
      const uploadedMusic = await getUserMusic(user.uid);

      const allMusic: MusicTrack[] = uploadedMusic.map((music) => ({
        id: music.id,
        type: "upload" as const,
        audioUrl: music.url,
        spotifyUrl: "",
        title: music.title,
        artist: music.artist,
        fileName: music.name,
        size: music.size,
        uploadedAt: music.uploadedAt,
      }));

      setTracks(allMusic);
    } catch (error) {
      console.error("Error loading music from Firebase:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your music library",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isOpen, toast]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTracks(new Set());
    } else {
      loadMusicFromFirebase();
      // Start with upload tab if no tracks exist, otherwise start with library
      setActiveTab(tracks.length === 0 ? "upload" : "library");
    }
  }, [isOpen, loadMusicFromFirebase]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        if (!validTypes.includes(file.type)) {
          throw new Error(`${file.name} is not a valid audio file`);
        }
        if (file.size > maxSize) {
          throw new Error(`${file.name} is too large (max 10MB)`);
        }

        // Update progress for this file
        const fileProgress = (index / files.length) * 100;
        setUploadProgress(fileProgress);

        // Upload to Firebase Storage
        const uploadedMusic = await uploadMusic(file, user.uid, {
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "",
        });

        const newTrack: MusicTrack = {
          id: uploadedMusic.id,
          type: "upload",
          audioUrl: uploadedMusic.url,
          spotifyUrl: "",
          title: uploadedMusic.title,
          artist: uploadedMusic.artist,
          fileName: uploadedMusic.name,
          size: uploadedMusic.size,
          uploadedAt: uploadedMusic.uploadedAt,
        };

        return newTrack;
      });

      const uploadedTracks = await Promise.all(uploadPromises);
      setTracks((prev) => [...uploadedTracks, ...prev]);

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        // Automatically switch to library tab after upload
        setActiveTab("library");
      }, 1000);

      toast({
        title: "Success",
        description: `${uploadedTracks.length} track(s) uploaded successfully to Firebase`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: (error as Error).message,
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Removed Spotify functionality

  const handleUpdateTrack = async (trackId: string, updates: Partial<MusicTrack>) => {
    if (!user) return;

    // Update local state immediately
    setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, ...updates } : track)));

    // For uploaded files, metadata is in Storage and doesn't need updating
    // Spotify functionality has been removed
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!user) return;

    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    try {
      // Only handle uploaded tracks now
      if (track.type === "upload") {
        // Delete from Firebase Storage
        await deleteMusic(user.uid, trackId);
      }

      // Remove from local state
      setTracks((prev) => prev.filter((track) => track.id !== trackId));
      setSelectedTracks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });

      toast({
        title: "Success",
        description: "Track deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting track:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete track",
      });
    }
  };

  const handleTrackSelect = (trackId: string) => {
    setSelectedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else if (newSet.size < maxTracks) {
        newSet.add(trackId);
      } else {
        toast({
          variant: "destructive",
          title: "Limit reached",
          description: `You can only select up to ${maxTracks} tracks`,
        });
      }
      return newSet;
    });
  };

  const handleConfirmSelection = () => {
    const selectedTracksList = tracks.filter((track) => selectedTracks.has(track.id));
    onSelectTracks(selectedTracksList);
    setSelectedTracks(new Set());
    onClose();
  };

  const handleSelectAll = () => {
    const availableTrackIds = filteredTracks.slice(0, maxTracks).map((track) => track.id);
    setSelectedTracks(new Set(availableTrackIds));
  };

  const handleClearSelection = () => {
    setSelectedTracks(new Set());
  };

  const filteredTracks = tracks.filter(
    (track) => track.title.toLowerCase().includes(searchTerm.toLowerCase()) || track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[999999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Music Gallery</h2>
            <p className="text-sm text-muted-foreground">
              Select up to {maxTracks} tracks {selectedTracks.size > 0 ? `(${selectedTracks.size} selected)` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedTracks.size > 0 && (
              <Button onClick={handleConfirmSelection} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add {selectedTracks.size} Track{selectedTracks.size !== 1 ? "s" : ""}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="library">Library ({tracks.length})</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="library" className="flex-1 flex flex-col m-0 px-6 pb-6">
              {/* Controls */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tracks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                {filteredTracks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={selectedTracks.size >= maxTracks}>
                      Select All
                    </Button>
                    {selectedTracks.size > 0 && (
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Tracks List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <h3 className="font-medium mb-2">Loading your music library...</h3>
                    <p className="text-sm text-muted-foreground">Please wait while we fetch your tracks from Firebase</p>
                  </div>
                ) : filteredTracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Music className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No tracks found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Try a different search term" : "Upload your first track to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTracks.map((track) => {
                      const isSelected = selectedTracks.has(track.id);
                      return (
                        <Card
                          key={track.id}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
                          onClick={() => handleTrackSelect(track.id)}
                        >
                          <CardContent className="flex items-center gap-4 p-4">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? "bg-primary border-primary" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>

                            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                              {track.type === "upload" ? <FileAudio className="h-6 w-6 text-primary" /> : <Music className="h-6 w-6 text-primary" />}
                            </div>

                            <div className="flex-1">
                              <h4 className="font-medium">{track.title}</h4>
                              <p className="text-sm text-muted-foreground">{track.artist || "Unknown Artist"} • Audio File</p>
                              {track.size && (
                                <p className="text-xs text-muted-foreground">
                                  {(track.size / (1024 * 1024)).toFixed(1)} MB
                                  {track.uploadedAt && ` • ${track.uploadedAt.toLocaleDateString()}`}
                                </p>
                              )}
                            </div>

                            {/* Spotify URL input removed */}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrack(track.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 m-0 p-6">
              <div className="space-y-6">
                {/* Upload Audio Files */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Upload Audio Files to Firebase</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">Drag and drop audio files here, or click to select files</p>
                  <input
                    type="file"
                    multiple
                    accept="audio/*"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <Button asChild disabled={isUploading}>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {isUploading ? "Uploading to Firebase..." : "Select Audio Files"}
                    </label>
                  </Button>
                  {isUploading && (
                    <div className="w-full max-w-sm mt-4 space-y-3">
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Uploading to Firebase Storage...</p>
                        <p className="text-xs text-muted-foreground">Please wait while we upload your files</p>
                      </div>
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                      </div>
                      {uploadProgress === 100 && (
                        <p className="text-xs text-green-600 text-center font-medium">Upload complete! Switching to library...</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Supported formats: MP3, WAV, OGG • Maximum file size: 10MB</p>
                </div>

                {/* Spotify functionality removed */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}
