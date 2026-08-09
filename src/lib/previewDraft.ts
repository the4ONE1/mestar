export interface PreviewDraft {
  childName: string;
  theme: string;
  photoData: string | null; // base64 data-URL or null
  savedAt: number;
}

const DRAFT_KEY = "mestar-preview-draft";
const MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

// In-memory copy survives client-side navigation even when localStorage
// rejects the write (quota exceeded on large photos / Safari private mode).
let memoryDraft: PreviewDraft | null = null;

export function saveDraft(draft: PreviewDraft) {
  memoryDraft = draft;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Photo too big for storage — keep it in memory so the order still carries it.
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, photoData: null }));
    } catch { /* ignore */ }
  }
}

export function loadDraft(): PreviewDraft | null {
  let stored: PreviewDraft | null = null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) stored = JSON.parse(raw) as PreviewDraft;
  } catch { /* ignore */ }

  const candidate = memoryDraft ?? stored;
  if (!candidate) return null;
  if (Date.now() - candidate.savedAt > MAX_AGE_MS) {
    clearDraft();
    return null;
  }
  // Prefer whichever copy still has the photo.
  if (!candidate.photoData && memoryDraft?.photoData && stored && memoryDraft.childName === stored.childName) {
    return { ...candidate, photoData: memoryDraft.photoData };
  }
  return candidate;
}

export function clearDraft() {
  memoryDraft = null;
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

/**
 * Downscale + re-encode an uploaded photo so it comfortably fits in
 * localStorage and uploads fast. Falls back to the raw data URL on failure.
 */
export function compressPhoto(file: File, maxSize = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL("image/jpeg", quality);
          resolve(out.length < dataUrl.length ? out : dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
