import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface AudioTranscriberProps {
  onTranscribed: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscribed,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Mikrofonadgang nægtet eller ikke understøttet:', err);
      alert('Kunne ikke få adgang til mikrofonen. Tjek tilladelser i din browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const sendAudioForTranscription = async (blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: blob.type || 'audio/webm',
            }),
          });

          if (!res.ok) {
            throw new Error(`Fejl ved transskribering: ${res.statusText}`);
          }

          const data = await res.json();
          if (data.text) {
            onTranscribed(data.text.trim());
          }
        } catch (fetchErr) {
          console.error(fetchErr);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {isLoading ? (
        <button
          type="button"
          disabled
          className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 animate-pulse flex items-center gap-1 text-xs"
          title="Transskriberer tale med Gemini..."
        >
          <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
          <span className="hidden sm:inline text-[11px] font-medium">Lytter...</span>
        </button>
      ) : isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="p-1.5 rounded-lg bg-rose-600 text-white animate-pulse flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
          title="Stop optagelse og transskriber"
        >
          <MicOff className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Stop optagelse</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs cursor-pointer"
          title="Tal ind med mikrofonen (Gemini-transskribering)"
        >
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px]">Tal ind</span>
        </button>
      )}
    </div>
  );
};
