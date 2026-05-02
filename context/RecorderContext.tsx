import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

export type Resolution = "480p" | "720p" | "1080p" | "2K" | "4K";
export type FPS = 24 | 30 | 60 | 120;
export type BitrateMbps = 2 | 4 | 8 | 16 | 32;
export type AudioSource = "none" | "microphone" | "system" | "both";
export type VideoFormat = "mp4" | "webm" | "mkv";
export type Orientation = "auto" | "portrait" | "landscape";
export type CountdownSec = 0 | 3 | 5 | 10;
export type TimerLimit = "none" | "1min" | "5min" | "10min" | "30min";

export interface RecordingSettings {
  resolution: Resolution;
  fps: FPS;
  bitrate: BitrateMbps;
  audioSource: AudioSource;
  videoFormat: VideoFormat;
  showTouches: boolean;
  showTaps: boolean;
  countdown: CountdownSec;
  orientation: Orientation;
  hdrMode: boolean;
  gpuAcceleration: boolean;
  faceCamOverlay: boolean;
  timerLimit: TimerLimit;
}

export interface RecordingEntry {
  id: string;
  title: string;
  duration: number;
  sizeBytes: number;
  date: string;
  resolution: Resolution;
  fps: FPS;
  uri?: string;
}

interface RecorderContextValue {
  settings: RecordingSettings;
  updateSetting: <K extends keyof RecordingSettings>(
    key: K,
    value: RecordingSettings[K]
  ) => void;
  recordings: RecordingEntry[];
  isRecording: boolean;
  isPaused: boolean;
  elapsed: number;
  countdownValue: number | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  deleteRecording: (id: string) => void;
}

const defaultSettings: RecordingSettings = {
  resolution: "1080p",
  fps: 60,
  bitrate: 8,
  audioSource: "microphone",
  videoFormat: "mp4",
  showTouches: false,
  showTaps: false,
  countdown: 3,
  orientation: "auto",
  hdrMode: false,
  gpuAcceleration: true,
  faceCamOverlay: false,
  timerLimit: "none",
};

const RecorderContext = createContext<RecorderContextValue | null>(null);

const SETTINGS_KEY = "@captx_settings";
const RECORDINGS_KEY = "@captx_recordings";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function RecorderProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RecordingSettings>(defaultSettings);
  const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(SETTINGS_KEY);
        if (saved) setSettings(JSON.parse(saved));
        const recs = await AsyncStorage.getItem(RECORDINGS_KEY);
        if (recs) setRecordings(JSON.parse(recs));
      } catch {}
    })();
  }, []);

  const updateSetting = useCallback(
    <K extends keyof RecordingSettings>(key: K, value: RecordingSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const getResolutionDimensions = (res: Resolution) => {
    const map: Record<Resolution, { width: number; height: number }> = {
      "480p": { width: 854, height: 480 },
      "720p": { width: 1280, height: 720 },
      "1080p": { width: 1920, height: 1080 },
      "2K": { width: 2560, height: 1440 },
      "4K": { width: 3840, height: 2160 },
    };
    return map[res];
  };

  const getTimerLimitSeconds = (limit: TimerLimit): number | null => {
    const map: Record<TimerLimit, number | null> = {
      none: null,
      "1min": 60,
      "5min": 300,
      "10min": 600,
      "30min": 1800,
    };
    return map[limit];
  };

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(e);
      const limit = getTimerLimitSeconds(settings.timerLimit);
      if (limit && e >= limit) {
        stopRecording();
      }
    }, 500);
  }, [settings.timerLimit]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const doStartRecording = useCallback(async () => {
    setElapsed(0);

    if (Platform.OS === "web") {
      try {
        const dims = getResolutionDimensions(settings.resolution);
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: {
            frameRate: settings.fps,
            width: { ideal: dims.width },
            height: { ideal: dims.height },
          },
          audio: settings.audioSource !== "none",
        });

        streamRef.current = stream;
        chunksRef.current = [];

        const mimeType =
          settings.videoFormat === "webm"
            ? "video/webm;codecs=vp9"
            : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm";

        const mr = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const entry: RecordingEntry = {
            id: generateId(),
            title: `Recording ${new Date().toLocaleTimeString()}`,
            duration: elapsed,
            sizeBytes: blob.size,
            date: new Date().toISOString(),
            resolution: settings.resolution,
            fps: settings.fps,
            uri: url,
          };
          setRecordings((prev) => {
            const next = [entry, ...prev];
            AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(
              next.map(r => ({ ...r, uri: undefined }))
            )).catch(() => {});
            return next;
          });
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        };

        mr.start(1000);
        setIsRecording(true);
        startTimer();
      } catch (err) {
        console.error("Screen capture error:", err);
      }
    } else {
      setIsRecording(true);
      startTimer();
    }
  }, [settings, elapsed, startTimer]);

  const startRecording = useCallback(async () => {
    const countdownSec = settings.countdown;
    if (countdownSec > 0) {
      setCountdownValue(countdownSec);
      for (let i = countdownSec - 1; i >= 0; i--) {
        await new Promise((r) => setTimeout(r, 1000));
        setCountdownValue(i === 0 ? null : i);
      }
    }
    await doStartRecording();
  }, [settings.countdown, doStartRecording]);

  const stopRecording = useCallback(() => {
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    if (Platform.OS === "web" && mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    } else {
      const entry: RecordingEntry = {
        id: generateId(),
        title: `Recording ${new Date().toLocaleTimeString()}`,
        duration: elapsed,
        sizeBytes: Math.round(
          (settings.bitrate * 1024 * 1024 * elapsed) / 8
        ),
        date: new Date().toISOString(),
        resolution: settings.resolution,
        fps: settings.fps,
      };
      setRecordings((prev) => {
        const next = [entry, ...prev];
        AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    }
    setElapsed(0);
  }, [elapsed, settings]);

  const pauseRecording = useCallback(() => {
    if (Platform.OS === "web" && mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    stopTimer();
    setIsPaused(true);
  }, []);

  const resumeRecording = useCallback(() => {
    if (Platform.OS === "web" && mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    startTimer();
    setIsPaused(false);
  }, [startTimer]);

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const next = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <RecorderContext.Provider
      value={{
        settings,
        updateSetting,
        recordings,
        isRecording,
        isPaused,
        elapsed,
        countdownValue,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        deleteRecording,
      }}
    >
      {children}
    </RecorderContext.Provider>
  );
}

export function useRecorder() {
  const ctx = useContext(RecorderContext);
  if (!ctx) throw new Error("useRecorder must be used inside RecorderProvider");
  return ctx;
}
