import { motion } from 'framer-motion';
import { GAME_CONFIG } from '@/types/game';

interface ExplosiveArrowProps {
  gridX: number;
  gridY: number;
}

export function ExplosiveArrow({ gridX, gridY }: ExplosiveArrowProps) {
  const pixelX = gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
  const pixelY = gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: pixelX,
        top: pixelY,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        {/* 爆炸标记 */}
        <circle cx="10" cy="10" r="8" fill="#dc2626" />
        <circle cx="10" cy="10" r="5" fill="#ef4444" />
        <text x="10" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
      </svg>
      {/* 火焰效果 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
        }}
      >
        <div
          className="w-8 h-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
