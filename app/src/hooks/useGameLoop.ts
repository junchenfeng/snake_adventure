import { useCallback, useRef, useEffect } from 'react';

export interface GameLoopOptions {
  onUpdate: (deltaTime: number) => void;
  onRender: () => void;
  targetFPS?: number;
}

export function useGameLoop({ onUpdate, onRender, targetFPS = 60 }: GameLoopOptions) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const frameInterval = 1000 / targetFPS;

  const loop = useCallback((time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    // 累积时间
    accumulatedTimeRef.current += deltaTime;

    // 固定时间步长更新
    while (accumulatedTimeRef.current >= frameInterval) {
      onUpdate(frameInterval / 1000); // 转换为秒
      accumulatedTimeRef.current -= frameInterval;
    }

    // 渲染
    onRender();

    requestRef.current = requestAnimationFrame(loop);
  }, [onUpdate, onRender, frameInterval]);

  const start = useCallback(() => {
    if (requestRef.current === null) {
      previousTimeRef.current = null;
      accumulatedTimeRef.current = 0;
      requestRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const stop = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}
