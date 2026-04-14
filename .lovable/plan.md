

# Add Audio to Intro Video

## Problem
The promo video plays muted because browsers block autoplay with sound. We need to attempt sound playback with a graceful fallback.

## Plan

**File: `src/pages/Index.tsx`**

1. Remove the `muted` attribute from the `<video>` tag
2. Add a `useEffect` that tries to play the video with sound using `video.play().catch()`
3. If the browser blocks it (most will for first-time visitors), fall back to muted playback and show a "🔊 Tap for sound" button in the corner
4. When the user taps the button, unmute the video

### Technical detail
- Add `isMuted` state to track mute status
- In `useEffect`, attempt `videoRef.current.play()` — on rejection, set `videoRef.current.muted = true`, retry play, and set `isMuted = true`
- Render a small speaker icon button (bottom-right corner) when `isMuted` is true — clicking it sets `videoRef.current.muted = false` and hides the button
- This gives sound when the browser allows it, and a one-tap unmute when it doesn't

