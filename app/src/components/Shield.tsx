import { motion } from 'framer-motion';
import { GAME_CONFIG } from '@/types/game';

interface ShieldProps {
  gridX: number;
  gridY: number;
}

export function Shield({ gridX, gridY }: ShieldProps) {
  const pixelX = gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
  const pixelY = gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

  return (
    <motion.div
      className="absolute"
      style={{
        left: pixelX - 12,
        top: pixelY - 12,
        width: 24,
        height: 24,
      }}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.05, 1],
      }}
      transition={{
        rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
        scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 10px #3b82f6)',
        }}
      >
        <path
          d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
          fill="url(#shieldGradient)"
          stroke="#60a5fa"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
