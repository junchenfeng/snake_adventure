import { motion } from 'framer-motion';
import { GAME_CONFIG } from '@/types/game';

interface FruitProps {
  gridX: number;
  gridY: number;
}

export function Fruit({ gridX, gridY }: FruitProps) {
  const pixelX = gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
  const pixelY = gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

  return (
    <motion.div
      className="absolute"
      style={{
        left: pixelX - 8,
        top: pixelY - 8,
        width: 16,
        height: 16,
      }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* 圆形果实 */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          boxShadow: '0 0 15px rgba(251, 191, 36, 0.6), inset -2px -2px 4px rgba(0,0,0,0.2)',
        }}
      />
      {/* 叶子 */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-3 rounded-full"
        style={{
          background: '#4ade80',
          transform: 'translateX(-50%) rotate(-30deg)',
        }}
      />
    </motion.div>
  );
}
