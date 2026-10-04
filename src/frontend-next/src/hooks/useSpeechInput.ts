"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const SPEECH_LANGUAGES = [
  { id: "en-US", label: "EN" },
  { id: "hi-IN", label: "HI" },
  { id: "ko-KR", label: "KO" },
] as const;

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechConstructor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Browser-native speech recognition. Returns supported=false when the
 * Web Speech API is missing so the UI can hide the microphone.
 */
export function useSpeechInput(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState<(typeof SPEECH_LANGUAGES)[number]["id"]>("en-US");
  const recRef = useRef<SpeechRec | null>(null);
  const sessionRef = useRef(0);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(Boolean(getSpeechConstructor()));
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechConstructor();
    if (!Ctor) return;
    stop();
    const session = sessionRef.current;
    const rec = new Ctor();
    rec.lang = language;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event) => {
      if (session !== sessionRef.current) return;
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (text) onTranscriptRef.current(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [language, stop]);

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, language, setLanguage, start, stop };
}
