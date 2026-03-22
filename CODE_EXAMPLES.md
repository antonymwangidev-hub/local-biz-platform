# Media Upload System - Code Examples & Reference

## 📝 File Locations & Sizes

| File                                                            | Type     | Size       | Status |
| --------------------------------------------------------------- | -------- | ---------- | ------ |
| `src/lib/mediaUpload.ts`                                        | New      | 285 lines  | ✅     |
| `src/pages/Events.tsx`                                          | Modified | +101 lines | ✅     |
| `src/components/CreatePostModal.tsx`                            | Modified | +158 lines | ✅     |
| `src/integrations/supabase/types.ts`                            | Modified | +25 lines  | ✅     |
| `supabase/migrations/20260323000000_add_attachments_column.sql` | New      | 16 lines   | ✅     |

## 🔧 API Reference

### Core Utility Functions

#### `validateFile(file: File)`

Validates file type and size.

**Returns**: `{ valid: boolean; error?: string }`

**Example**:

```typescript
const result = validateFile(file);
if (!result.valid) {
  console.error(result.error); // "Image too large. Maximum size: 10MB..."
}
```

#### `uploadFileToStorage(file: File, userId: string)`

Uploads file to Supabase Storage.

**Returns**: `Promise<{ url: string; path: string } | null>`

**Example**:

```typescript
const upload = await uploadFileToStorage(file, user.id);
console.log(upload?.url); // Public URL to file
```

#### `createAttachmentFromFile(file: File, userId: string, uploadedUrl: string)`

Creates attachment object with metadata.

**Returns**: `Promise<Attachment>`

**Example**:

```typescript
const attachment = await createAttachmentFromFile(file, userId, url);
console.log(attachment.thumbnail_url); // For videos
console.log(attachment.width, attachment.height); // For images
```

#### `processFilesForUpload(files: File[], userId: string)`

Batch process multiple files.

**Returns**: `Promise<Attachment[]>`

**Example**:

```typescript
const attachments = await processFilesForUpload(
  Array.from(fileInput.files),
  user.id,
);
console.log(attachments.length); // 3
```

#### `getAttachmentPreviewUrl(attachment: Attachment)`

Gets appropriate preview URL (thumbnail for videos, image for images).

**Returns**: `string`

**Example**:

```typescript
<img src={getAttachmentPreviewUrl(attachment)} alt="Preview" />
```

#### `isVideoAttachment(attachment: Attachment)`

Check if attachment is video.

**Returns**: `boolean`

**Example**:

```typescript
if (isVideoAttachment(attachment)) {
  // Render video player
}
```

#### `isImageAttachment(attachment: Attachment)`

Check if attachment is image.

**Returns**: `boolean`

**Example**:

```typescript
if (isImageAttachment(attachment)) {
  // Render image
}
```

## 📚 Usage Examples

### Example 1: Upload in Events Component

```typescript
import { processFilesForUpload, Attachment } from "@/lib/mediaUpload";

const [attachments, setAttachments] = useState<Attachment[]>([]);
const [uploading, setUploading] = useState(false);

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  setUploading(true);
  try {
    const newAttachments = await processFilesForUpload(files, user!.id);
    setAttachments((prev) => [...prev, ...newAttachments]);
  } finally {
    setUploading(false);
  }
};

const handleCreate = async () => {
  // First image becomes image_url
  const imageUrl = attachments.find((a) =>
    a.mime_type.startsWith("image/"),
  )?.url;

  await supabase.from("events").insert({
    user_id: user.id,
    title,
    image_url: imageUrl,
    attachments: attachments, // Full array
  });
};
```

### Example 2: Display Attachments

```typescript
import { getAttachmentPreviewUrl, isVideoAttachment } from '@/lib/mediaUpload';

export const EventAttachments = ({ event }: { event: DBEvent }) => {
  if (!event.attachments?.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {event.attachments.map((attachment) => (
        <div key={attachment.id} className="relative">
          {isVideoAttachment(attachment) ? (
            <div className="relative">
              <img
                src={attachment.thumbnail_url}
                alt="Video thumbnail"
                className="w-full h-24 object-cover rounded"
              />
              <PlayIcon className="absolute inset-0" />
            </div>
          ) : (
            <img
              src={getAttachmentPreviewUrl(attachment)}
              alt={attachment.filename}
              className="w-full h-24 object-cover rounded"
            />
          )}
          <p className="text-xs mt-1 truncate">{attachment.filename}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Validation Error Handling

```typescript
import { validateFile } from "@/lib/mediaUpload";

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  // Check each file
  const errors: string[] = [];
  files.forEach((file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  if (errors.length > 0) {
    setError(errors.join("\n"));
    toast({
      title: "Upload Error",
      description: errors.join("\n"),
      variant: "destructive",
    });
    return;
  }

  // Process valid files
  processFiles(files);
};
```

### Example 4: Batch Upload with Progress

```typescript
const handleMultipleFiles = async (files: File[]) => {
  const attachments: Attachment[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        failCount++;
        continue;
      }

      const { url } = await uploadFileToStorage(file, user!.id);
      const attachment = await createAttachmentFromFile(file, user!.id, url);
      attachments.push(attachment);
      successCount++;

      // Update progress
      setProgress({
        current: successCount + failCount,
        total: files.length,
      });
    } catch (error) {
      failCount++;
    }
  }

  return { attachments, successCount, failCount };
};
```

### Example 5: Query Event with Attachments

```typescript
// Fetch events with attachments
const fetchEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*, attachments")
    .order("event_date", { ascending: true });

  if (error) throw error;

  return data.map((event) => ({
    ...event,
    attachmentCount: (event.attachments as any[])?.length || 0,
    hasImages: event.attachments?.some((a) => a.mime_type.startsWith("image/")),
    hasVideos: event.attachments?.some((a) => a.mime_type.startsWith("video/")),
  }));
};
```

### Example 6: Type-Safe Database Operations

```typescript
import type { Database } from "@/integrations/supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

const createEvent = async (eventData: {
  title: string;
  attachments: Attachment[];
}): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: eventData.title,
      attachments: eventData.attachments, // Type-checked!
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## 🎨 UI Component Examples

### Upload Zone Component

```tsx
interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  error?: string;
}

export const UploadZone = ({
  onFilesSelected,
  isLoading,
  error,
}: UploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
          className="hidden"
          disabled={isLoading}
        />
        <div className="text-center">
          <Upload className="mx-auto mb-2" />
          <p>Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">
            Images: JPG, PNG, WebP (max 10MB) • Videos: MP4, WebM (max 150MB)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
```

### Attachment Preview Component

```tsx
interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: (id: string) => void;
}

export const AttachmentPreview = ({
  attachment,
  onRemove,
}: AttachmentPreviewProps) => {
  const isVideo = attachment.mime_type.startsWith("video/");
  const previewUrl = isVideo ? attachment.thumbnail_url : attachment.url;

  return (
    <div className="relative group">
      <div className="relative">
        <img
          src={previewUrl}
          alt={attachment.filename}
          className="w-full h-20 object-cover rounded border border-border"
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
            <Play className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(attachment.id)}
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}

      <p className="text-xs mt-1 truncate text-muted-foreground">
        {attachment.filename}
      </p>
    </div>
  );
};
```

## 🗄️ Database Schema

### Events Table Addition

```sql
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_events_attachments
ON public.events USING GIN (attachments);
```

### Sample Query

```sql
-- Get events with their attachments
SELECT
  id,
  title,
  image_url,
  attachments,
  jsonb_array_length(attachments) as attachment_count,
  -- Extract first image URL
  (attachments->0->>'url') as first_attachment_url
FROM public.events
WHERE attachments IS NOT NULL
  AND jsonb_array_length(attachments) > 0
ORDER BY created_at DESC
LIMIT 10;
```

## 🧪 Testing Examples

### Unit Test Example

```typescript
import { validateFile } from "@/lib/mediaUpload";

describe("validateFile", () => {
  it("accepts valid image files", () => {
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejects oversized images", () => {
    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], "test.jpg", {
      type: "image/jpeg",
    });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("rejects unsupported formats", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid file type");
  });
});
```

### Integration Test Example

```typescript
describe("Event Creation with Media", () => {
  it("creates event with attachments", async () => {
    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

    // Upload file
    const attachments = await processFilesForUpload([file], userId);

    // Create event
    const { data: event } = await supabase
      .from("events")
      .insert({
        user_id: userId,
        title: "Test Event",
        attachments,
      })
      .select()
      .single();

    // Verify
    expect(event.attachments).toHaveLength(1);
    expect(event.image_url).toBe(attachments[0].url);
  });
});
```

## 🔍 Debugging Tips

### Enable Detailed Logging

```typescript
// Add to mediaUpload.ts
const DEBUG = true;

const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[MediaUpload] ${message}`, data);
  }
};

// Usage in functions
log("Starting file validation", { filename: file.name, size: file.size });
```

### Inspect Storage Uploads

```typescript
// List all files in media bucket
const { data, error } = await supabase.storage
  .from("media")
  .list(`users/${userId}`);

console.log("Uploaded files:", data);
```

### Check Database

```typescript
// Query attachment data
const { data: events } = await supabase
  .from("events")
  .select("id, title, attachments")
  .not("attachments", "eq", "[]");

console.log("Events with attachments:", events);
```

## 📋 Validation Rules

### Images

- **Accepted Formats**: JPEG, PNG, WebP
- **Max Size**: 10 MB
- **MIME Types**: `image/jpeg`, `image/png`, `image/webp`

### Videos

- **Accepted Formats**: MP4, WebM
- **Max Size**: 150 MB
- **MIME Types**: `video/mp4`, `video/webm`

### Error Messages

```
"Invalid file type. Allowed: jpeg, png, webp for images, mp4, webm for videos"
"Image too large. Maximum size: 10MB (your file: 15.2MB)"
"Video too large. Maximum size: 150MB (your file: 200MB)"
```

## 🚀 Performance Tips

1. **Batch Operations**: Use `processFilesForUpload` for multiple files
2. **Lazy Loading**: Load attachments only when needed
3. **Image Optimization**: Consider resizing before upload
4. **Caching**: Storage URLs are cached (3600s)
5. **Async Operations**: Use async/await properly

## ✅ Checklist for Implementation

- [ ] Migration applied to database
- [ ] mediaUpload.ts utility created
- [ ] Events.tsx updated with upload UI
- [ ] CreatePostModal.tsx updated with upload UI
- [ ] types.ts updated with attachments
- [ ] Environment variables verified
- [ ] Storage bucket configured
- [ ] RLS policies set correctly
- [ ] Tested image uploads
- [ ] Tested video uploads
- [ ] Tested error scenarios
- [ ] Verified database persistence
- [ ] Checked file storage
- [ ] Confirmed thumbnail generation

---

**Reference Version**: 1.0.0
**Last Updated**: March 23, 2026
