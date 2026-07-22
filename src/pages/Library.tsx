import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Volume2,
  BookOpen,
  GraduationCap,
  MousePointerClick,
  Languages,
} from "lucide-react";
import SEO from "@/components/SEO";

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface AudioPage {
  pageNumber: number;
  text: string;
  audioUrl: string | null;
  wordTimings: WordTiming[];
}

interface AudiobookData {
  orderId: string;
  storyTitle: string | null;
  childName: string | null;
  tier?: AudioTier;
  status: "pending" | "partial" | "ready";
  readyPages: number;
  totalPages: number;
  pages: AudioPage[];
}

const POLL_INTERVAL_MS = 5000;
const SUPABASE_FN_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

type AudioTier = "classic" | "interactive";

function cleanWord(word: string) {
  return word.toLowerCase().replace(/[^a-z']/g, "");
}

function splitSyllables(word: string) {
  const cleaned = cleanWord(word);
  if (!cleaned) return [word];
  if (cleaned.length <= 4) return [cleaned];
  const parts = cleaned.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/g);
  return parts && parts.length > 1 ? parts : [cleaned];
}

function phonicsHint(word: string) {
  const cleaned = cleanWord(word);
  if (!cleaned) return "Listen and repeat the word.";
  if (cleaned.includes("sh")) return "Notice the sh sound, like in shine.";
  if (cleaned.includes("ch")) return "Notice the ch sound, like in chair.";
  if (cleaned.includes("th")) return "Put your tongue gently between your teeth for th.";
  if (cleaned.includes("oo")) return "The oo sound can be heard in moon or book.";
  if (cleaned.endsWith("ing")) return "Break off the ending: ing.";
  const first = cleaned[0];
  return `Start with the ${first.toUpperCase()} sound, then blend the rest.`;
}

const Library = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AudiobookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [tappedWordIndex, setTappedWordIndex] = useState<number | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordReplayStopRef = useRef<number | null>(null);

  // Per-order access token — required by get-audiobook. Read from URL first,
  // fall back to localStorage (set in the checkout flow).
  const searchParams = new URLSearchParams(window.location.search);
  const urlToken = searchParams.get("token");
  const urlTier = searchParams.get("tier");
  let storedToken: string | null = null;
  let storedTier: AudioTier = "interactive";
  try {
    const saved = localStorage.getItem("mestar-pending-story");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.orderId === orderId && parsed?.recoveryToken) storedToken = parsed.recoveryToken;
      const t = parsed?.audiobookTier || parsed?.selectedAddons?.audiobookTier;
      if (t === "classic" || t === "interactive") storedTier = t;
    }
  } catch { /* ignore */ }
  const accessToken = urlToken || storedToken;
  const tier: AudioTier = urlTier === "classic" ? "classic" : urlTier === "interactive" ? "interactive" : storedTier;
  const isInteractive = tier === "interactive";


  void storedTier;

  // Fetch + poll until audiobook is fully ready
  useEffect(() => {
    if (!orderId) return;
    if (!accessToken) {
      setError("Missing access token. Please open your audiobook from the order confirmation page or your email link.");
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${SUPABASE_FN_BASE}/get-audiobook?orderId=${orderId}&token=${encodeURIComponent(accessToken)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || `Could not load audiobook (${res.status})`);
          return;
        }
        const json: AudiobookData = await res.json();
        if (cancelled) return;
        setData(json);
        if (json.status !== "ready") {
          setTimeout(load, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (!cancelled) setError("Network error — please try again.");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const currentPage = data?.pages[pageIndex];
  const focusIndex = tappedWordIndex ?? selectedWordIndex ?? activeWordIndex;
  const focusWord = isInteractive && currentPage?.wordTimings?.[focusIndex]
    ? currentPage.wordTimings[focusIndex].word
    : null;
  const syllables = focusWord ? splitSyllables(focusWord) : [];

  // Reset state when changing pages
  useEffect(() => {
    setActiveWordIndex(-1);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [pageIndex]);

  // Drive word highlighting from audio currentTime
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentPage) return;

    const timings = currentPage.wordTimings;
    const onTimeUpdate = () => {
      const t = audio.currentTime;
      // Linear scan is fine for ~150 words; remember last index for fast-path
      let idx = -1;
      for (let i = 0; i < timings.length; i++) {
        if (t >= timings[i].start && t <= timings[i].end + 0.05) {
          idx = i;
          break;
        }
        if (t < timings[i].start) break;
      }
      // If between words, keep the last spoken word highlighted
      if (idx === -1) {
        for (let i = timings.length - 1; i >= 0; i--) {
          if (t > timings[i].end) {
            idx = i;
            break;
          }
        }
      }
      if (idx !== activeWordIndex) {
        setActiveWordIndex(idx);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setActiveWordIndex(-1);
      // Auto-advance to next page
      if (data && pageIndex < data.pages.length - 1) {
        setTimeout(() => setPageIndex((p) => p + 1), 800);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [currentPage, activeWordIndex, pageIndex, data]);

  // Scroll active word into view
  useEffect(() => {
    if (activeWordIndex < 0) return;
    const el = wordRefs.current[activeWordIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeWordIndex]);

  // Auto-play next page when it loads (only after first user-initiated play)
  const [hasUserPlayed, setHasUserPlayed] = useState(false);
  useEffect(() => {
    if (hasUserPlayed && audioRef.current && currentPage?.audioUrl) {
      audioRef.current.play().catch(() => {});
    }
  }, [pageIndex, hasUserPlayed, currentPage?.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch((e) => console.error("Play failed:", e));
      setHasUserPlayed(true);
    } else {
      audio.pause();
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  // Keep the <audio> element's playbackRate in sync with state
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, currentPage?.audioUrl]);

  // Interactive-tier: tap a word to hear just that word (seek + play + auto-pause)
  const handleWordTap = (index: number) => {
    if (!isInteractive) return;
    const audio = audioRef.current;
    const timing = currentPage?.wordTimings[index];
    if (!audio || !timing) return;
    if (wordReplayStopRef.current) {
      window.clearTimeout(wordReplayStopRef.current);
      wordReplayStopRef.current = null;
    }
    setTappedWordIndex(index);
    setSelectedWordIndex(index);
    audio.currentTime = Math.max(0, timing.start - 0.02);
    audio.play().catch(() => {});
    const durationMs = Math.max(250, (timing.end - timing.start) * 1000 / playbackRate + 120);
    wordReplayStopRef.current = window.setTimeout(() => {
      audio.pause();
      setTappedWordIndex(null);
      wordReplayStopRef.current = null;
    }, durationMs);
  };

  const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
  const goNext = () =>
    setPageIndex((p) => Math.min((data?.pages.length ?? 1) - 1, p + 1));

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SEO title="Audiobook | MESTAR" description="Listen to your personalized storybook with karaoke-style word highlighting." noindex />
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">🎧</p>
          <h1 className="font-display text-2xl font-bold mb-2">Can't open this audiobook</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO title="Audiobook | MESTAR" description="Listen to your personalized storybook with karaoke-style word highlighting." noindex />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Still generating ──
  if (data.status === "pending" || data.totalPages === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SEO title="Audiobook | MESTAR" description="Listen to your personalized storybook with karaoke-style word highlighting." noindex />
        <div className="text-center max-w-md">
          <Volume2 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <h1 className="font-display text-2xl font-bold mb-2">Recording your audiobook…</h1>
          <p className="text-muted-foreground mb-6">
            Our narrator is reading the story page by page. This usually takes 1–2 minutes.
            The page will refresh automatically.
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  // ── Karaoke player ──
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${data.storyTitle || "Audiobook"} | MESTAR`}
        description="Listen to your personalized storybook with karaoke-style word highlighting."
        noindex
      />

      <div className="container max-w-3xl py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            {isInteractive ? <GraduationCap className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {isInteractive ? "Interactive Read-Along" : "Classic Audiobook"}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {data.storyTitle || (data.childName ? `${data.childName}'s Story` : "Your Story")}
          </h1>
          {data.status === "partial" && (
            <p className="text-xs text-muted-foreground mt-2">
              Still recording {data.totalPages - data.readyPages} more page
              {data.totalPages - data.readyPages !== 1 ? "s" : ""}…
            </p>
          )}
        </div>

        {/* Page indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {data.pages.map((p, i) => (
            <button
              key={p.pageNumber}
              onClick={() => setPageIndex(i)}
              disabled={!p.audioUrl}
              aria-label={`Go to page ${p.pageNumber}`}
              className={`h-2 rounded-full transition-all ${
                i === pageIndex
                  ? "w-8 bg-primary"
                  : p.audioUrl
                    ? "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                    : "w-2 bg-muted-foreground/20 cursor-not-allowed"
              }`}
            />
          ))}
        </div>

        {isInteractive && (
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-card border border-primary/30 rounded-2xl p-4">
              <MousePointerClick className="h-5 w-5 text-primary mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tap Words</p>
              <p className="text-sm font-semibold text-foreground">Hear any word again</p>
            </div>
            <div className="bg-card border border-primary/30 rounded-2xl p-4">
              <Languages className="h-5 w-5 text-primary mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Syllables</p>
              <p className="text-sm font-semibold text-foreground">Break big words apart</p>
            </div>
            <div className="bg-card border border-primary/30 rounded-2xl p-4">
              <GraduationCap className="h-5 w-5 text-primary mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phonics</p>
              <p className="text-sm font-semibold text-foreground">Sound-it-out help</p>
            </div>
          </div>
        )}

        {isInteractive && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 mb-4 min-h-[132px]">
            {focusWord ? (
              <div className="grid sm:grid-cols-[1fr_1.2fr] gap-4 items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Reading Help</p>
                  <p className="font-display text-2xl font-extrabold text-primary">{focusWord.replace(/\s+/g, "")}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {syllables.map((part, index) => (
                      <span key={`${part}-${index}`} className="rounded-full bg-background border border-primary/30 px-3 py-1 text-sm font-bold text-foreground">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-background/70 border border-border p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Sound it out</p>
                  <p className="text-sm font-medium text-foreground">{phonicsHint(focusWord)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="font-display font-bold text-foreground">Press play or tap a word to start Learning Mode</p>
                <p className="text-sm text-muted-foreground mt-1">The active word will appear here with syllables and a sound-it-out hint.</p>
              </div>
            )}
          </div>
        )}

        {/* Text card with karaoke highlighting */}
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 mb-4 min-h-[280px] shadow-lg">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-4 text-center">
            Page {currentPage?.pageNumber} of {data.totalPages}
          </p>
          <div className="text-lg sm:text-2xl leading-relaxed sm:leading-loose text-foreground font-medium text-center">
            {currentPage?.wordTimings.length ? (
              currentPage.wordTimings.map((w, i) => {
                const isActive = isInteractive && i === activeWordIndex;
                const isTapped = i === tappedWordIndex;
                const isPast = isInteractive && i < activeWordIndex;
                return (
                  <span
                    key={i}
                    ref={(el) => (wordRefs.current[i] = el)}
                    onClick={() => handleWordTap(i)}
                    role={isInteractive ? "button" : undefined}
                    tabIndex={isInteractive ? 0 : -1}
                    onKeyDown={(e) => {
                      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleWordTap(i);
                      }
                    }}
                    className={`inline-block transition-all duration-100 rounded px-1 py-0.5 ${
                      isInteractive ? "cursor-pointer hover:bg-primary/10" : ""
                    } ${
                      isTapped
                        ? "bg-accent text-accent-foreground scale-110 shadow-md ring-2 ring-primary"
                        : isActive
                          ? "bg-primary text-primary-foreground scale-110 shadow-md underline decoration-primary-foreground/70 decoration-4 underline-offset-4"
                          : isPast
                            ? "text-foreground/60"
                            : "text-foreground"
                    }`}
                  >
                    {w.word}{" "}
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground">{currentPage?.text}</span>
            )}
          </div>
        </div>

        {/* Hidden audio element */}
        {currentPage?.audioUrl && (
          <audio ref={audioRef} src={currentPage.audioUrl} preload="auto" />
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goPrev}
            disabled={pageIndex === 0}
            aria-label="Previous page"
            className="rounded-full h-12 w-12"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            onClick={togglePlay}
            disabled={!currentPage?.audioUrl}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="rounded-full h-16 w-16 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30"
          >
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={restart}
            disabled={!currentPage?.audioUrl}
            aria-label="Restart page"
            className="rounded-full h-12 w-12"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={goNext}
            disabled={pageIndex >= data.pages.length - 1}
            aria-label="Next page"
            className="rounded-full h-12 w-12"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Speed control */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold mr-1">Speed</span>
          {[0.75, 1, 1.25].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setPlaybackRate(rate)}
              className={`text-xs font-bold rounded-full px-3 py-1 border transition-all ${
                playbackRate === rate
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mb-8">
          {isInteractive
            ? "Press play for karaoke highlighting — tap any word for replay, syllables, and sound-it-out help."
            : "Press play and enjoy — sit back and listen together."}
        </p>

        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/order-complete?order_id=${orderId}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Download the PDF
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Library;
