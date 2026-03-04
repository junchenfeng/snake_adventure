import { motion } from 'framer-motion';
import { GAME_CONFIG } from '@/types/game';

interface BowProps {
  gridX: number;
  gridY: number;
}

export function Bow({ gridX, gridY }: BowProps) {
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
        scale: [1, 1.1, 1],
        filter: [
          'brightness(1)',
          'brightness(1.3)',
          'brightness(1)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 10px #d97706)',
        }}
      >
        {/* 弓身 */}
        <path
          d="M4 2C4 2 4 12 4 12C4 16 7 20 12 20C17 20 20 16 20 12C20 12 20 2 20 2"
          stroke="url(#bowGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* 弓弦 */}
        <line
          x1="4"
          y1="2"
          x2="4"
          y2="20"
          stroke="#fcd34d"
          strokeWidth="1"
        />
        {/* 箭 */}
        <line
          x1="4"
          y1="11"
          x2="18"
          y2="11"
          stroke="#92400e"
          strokeWidth="2"
        />
        <polygon
          points="18,11 16,9 16,13"
          fill="#92400e"
        />
        <defs>
          <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
