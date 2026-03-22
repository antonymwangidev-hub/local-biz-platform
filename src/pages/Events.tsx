import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Plus, Ticket, Upload, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { processFilesForUpload, validateFile, Attachment, getAttachmentPreviewUrl } from "@/lib/mediaUpload";

interface DBEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  capacity: number | null;
  price: number | null;
  image_url: string | null;
  location: string | null;
  attachments?: Attachment[];
  created_at: string;
  user_id: string;
  business_id: string | null;
  businesses: { name: string; slug: string; logo: string | null } | null;
  event_rsvps: { id: string; user_id: string; status: string }[];
}

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`*, businesses(name, slug, logo), event_rsvps(id, user_id, status)`)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data as unknown as DBEvent[];
    },
  });

  const handleCreateEvent = async () => {
    if (!title.trim() || !eventDate || !user) return;
    setCreating(true);
    
    // Use first image as image_url if available
    let imageUrl: string | null = null;
    if (attachments.length > 0) {
      const firstImage = attachments.find((a) => a.mime_type.startsWith("image/"));
      if (firstImage) {
        imageUrl = firstImage.url;
      }
    }

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      event_date: new Date(eventDate).toISOString(),
      location: location.trim() || null,
      capacity: capacity ? parseInt(capacity) : null,
      price: price ? parseFloat(price) : 0,
      image_url: imageUrl,
      attachments: attachments,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Event created!" });
    setTitle(""); setDescription(""); setEventDate(""); setLocation(""); setCapacity(""); setPrice("");
    setAttachments([]);
    setUploadError(null);
    setCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setUploadError(null);

    try {
      // Validate all files first
      const invalidFiles = files.filter((f) => !validateFile(f).valid);
      if (invalidFiles.length > 0) {
        const errors = invalidFiles.map((f) => {
          const validation = validateFile(f);
          return `${f.name}: ${validation.error}`;
        });
        setUploadError(errors.join("\n"));
        setUploadingFiles(false);
        return;
      }

      const newAttachments = await processFilesForUpload(files, user!.id);
      if (newAttachments.length === 0) {
        setUploadError("No files were successfully uploaded");
      } else {
        setAttachments((prev) => [...prev, ...newAttachments]);
        toast({ title: `${newAttachments.length} file(s) uploaded successfully` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      toast({ title: "Sign in to RSVP", variant: "destructive" });
      return;
    }
    const event = events.find((e) => e.id === eventId);
    const existingRsvp = event?.event_rsvps.find((r) => r.user_id === user.id);
    if (existingRsvp) {
      await supabase.from("event_rsvps").delete().eq("id", existingRsvp.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id, status: "going" });
    }
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl flex items-center gap-2">
                  <Calendar size={28} className="text-secondary" />
                  Events & Workshops
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Discover and attend local events</p>
              </div>
              {user && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus size={18} />
                      <span className="hidden sm:inline">Create Event</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display">Create Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
                      <Textarea placeholder="Event description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="resize-none" />
                      <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                      <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="number" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                        <Input type="number" step="0.01" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
                      </div>

                      {/* File Upload Section */}
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload size={24} className="text-muted-foreground" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">Upload Images or Videos</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Images: JPG, PNG, WebP (max 10MB) • Videos: MP4, WebM (max 150MB)
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            disabled={uploadingFiles}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFiles}
                          >
                            {uploadingFiles ? "Uploading..." : "Select Files"}
                          </Button>
                        </div>
                      </div>

                      {/* Error Alert */}
                      {uploadError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="whitespace-pre-wrap text-xs">{uploadError}</AlertDescription>
                        </Alert>
                      )}

                      {/* Attachments Preview */}
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Uploaded Files ({attachments.length})</p>
                          <div className="grid grid-cols-3 gap-2">
                            {attachments.map((att) => (
                              <div key={att.id} className="relative group">
                                <img
                                  src={getAttachmentPreviewUrl(att)}
                                  alt={att.filename}
                                  className="w-full h-20 object-cover rounded border border-border"
                                />
                                <button
                                  onClick={() => removeAttachment(att.id)}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button variant="hero" className="w-full" onClick={handleCreateEvent} disabled={!title.trim() || !eventDate || creating || uploadingFiles}>
                        {creating ? "Creating…" : "Create Event"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full py-20 text-center text-muted-foreground">Loading events…</div>
              ) : events.length > 0 ? (
                events.map((event, i) => {
                  const rsvpCount = event.event_rsvps.length;
                  const isRsvped = user ? event.event_rsvps.some((r) => r.user_id === user.id) : false;
                  const isFull = event.capacity ? rsvpCount >= event.capacity : false;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="group rounded-xl border border-border bg-card shadow-card overflow-hidden transition-all hover:shadow-card-hover"
                    >
                      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                        ) : (
                          <Calendar size={48} className="text-primary/40" />
                        )}
                        {event.price && event.price > 0 && (
                          <span className="absolute top-3 right-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                            ${Number(event.price).toFixed(2)}
                          </span>
                        )}
                        {event.price === 0 || !event.price ? (
                          <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                            Free
                          </span>
                        ) : null}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold text-card-foreground line-clamp-1">{event.title}</h3>
                        {event.businesses && (
                          <p className="mt-1 text-xs text-muted-foreground">by {event.businesses.name}</p>
                        )}
                        {event.description && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                        )}
                        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-primary" />
                            {format(new Date(event.event_date), "EEE, MMM d · h:mm a")}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-primary" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-primary" />
                            {rsvpCount} going{event.capacity ? ` / ${event.capacity} spots` : ""}
                          </div>
                        </div>
                        <Button
                          variant={isRsvped ? "outline" : "hero"}
                          size="sm"
                          className="mt-4 w-full gap-2"
                          onClick={() => handleRSVP(event.id)}
                          disabled={isFull && !isRsvped}
                        >
                          <Ticket size={14} />
                          {isRsvped ? "Cancel RSVP" : isFull ? "Event Full" : "RSVP"}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  No upcoming events. Be the first to create one!
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
