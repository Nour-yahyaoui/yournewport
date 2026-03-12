// components/FadeText.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface FadeTextProps {
  text: string;
  className?: string;
  lineClamp?: number;
}

export function FadeText({ text, className = '', lineClamp = 2 }: FadeTextProps) {
  const [needsFade, setNeedsFade] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * lineClamp;
      setNeedsFade(textRef.current.scrollHeight > maxHeight);
    }
  }, [text, lineClamp]);

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={`${className} line-clamp-${lineClamp}`}
        style={{
          WebkitLineClamp: lineClamp,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
      {needsFade && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
      )}
    </div>
  );
}