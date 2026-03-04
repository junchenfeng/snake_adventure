import { motion } from 'framer-motion';
import type { SnakeSegment } from '@/types/game';
import { GAME_CONFIG } from '@/types/game';

interface SnakeProps {
  segments: SnakeSegment[];
  isInvincible?: boolean;
  isPlayer?: boolean;
  color?: string;
  glowColor?: string;
}

export function Snake({
  segments,
  isInvincible = false,
  isPlayer = false,
  color = '#ef4444',
  glowColor = '#f87171',
}: SnakeProps) {
  return (
    <>
      {segments.map((segment, index) => {
        const isHead = index === 0;
        const size = GAME_CONFIG.GRID_SIZE - 2; // 方形，留出间隙
        const pixelX = segment.gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
        const pixelY = segment.gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

        return (
          <motion.div
            key={segment.id}
            className="absolute"
            initial={false}
            animate={{
              left: pixelX - size / 2,
              top: pixelY - size / 2,
            }}
            transition={{
              type: 'tween',
              ease: 'easeOut',
              duration: 0.08, // 平滑过渡
            }}
            style={{
              width: size,
              height: size,
              backgroundColor: isInvincible && Math.floor(Date.now() / 100) % 2 === 0
                ? '#ffffff'
                : color,
              boxShadow: `0 0 ${isHead ? 12 : 6}px ${glowColor}`,
              zIndex: segments.length - index,
            }}
          >
            {/* 头部眼睛 */}
            {isHead && isPlayer && (
              <>
                <div
                  className="absolute w-1.5 h-1.5 bg-white rounded-full"
                  style={{ left: 2, top: 2 }}
                />
                <div
                  className="absolute w-1.5 h-1.5 bg-white rounded-full"
                  style={{ right: 2, top: 2 }}
                />
              </>
            )}

            {/* 敌人眼睛 */}
            {isHead && !isPlayer && (
              <>
                <div
                  className="absolute w-1 h-1 bg-red-500 rounded-full"
                  style={{ left: 2, top: 3 }}
                />
                <div
                  className="absolute w-1 h-1 bg-red-500 rounded-full"
                  style={{ right: 2, top: 3 }}
                />
              </>
            )}
          </motion.div>
        );
      })}
    </>
  );
}
