import { useState, useEffect, useCallback } from 'react';

export function useTypewriter(text: string, speed: number = 50, startDelay: number = 0) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const start = useCallback(() => {
    setIsStarted(true);
  }, []);

  const reset = useCallback(() => {
    setDisplayText('');
    setIsComplete(false);
    setIsStarted(false);
  }, []);

  const skip = useCallback(() => {
    setDisplayText(text);
    setIsComplete(true);
  }, [text]);

  useEffect(() => {
    if (!isStarted) return;

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
      }
    };

    // 开始延迟
    timeoutId = setTimeout(typeNextChar, startDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, speed, startDelay, isStarted]);

  return {
    displayText,
    isComplete,
    isStarted,
    start,
    reset,
    skip,
  };
}
