'use client';

import { Share2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  prediction: {
    failure_probability: number;
    analysis_text: string;
  };
}

export default function ShareButton({ title, prediction }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🔮 My ${title} Failure Prediction: ${Math.round(prediction.failure_probability * 100)}% failure probability. "${prediction.analysis_text}" - Analyzed by Inverse Prediction Engine`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Failure Prediction',
          text: shareText,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-lg transition-all"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share Results</span>
        </>
      )}
    </button>
  );
}
