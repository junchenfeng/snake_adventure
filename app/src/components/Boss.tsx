import { motion } from 'framer-motion';
import type { Boss as BossType } from '@/types/game';
import { GAME_CONFIG } from '@/types/game';

interface BossProps {
  boss: BossType;
}

export function Boss({ boss }: BossProps) {
  const isParalyzed = boss.state === 'paralyzed';
  const isAiming = boss.state === 'aiming';
  const head = boss.segments[0];
  const pixelX = head.gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
  const pixelY = head.gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

  return (
    <>
      {/* 血条 */}
      <div
        className="absolute"
        style={{
          left: pixelX - 40,
          top: pixelY - 35,
          width: 80,
          height: 8,
        }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden"
          style={{ background: '#374151' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            }}
            initial={{ width: '100%' }}
            animate={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold"
          style={{ color: '#ef4444' }}
        >
          {boss.health}/{boss.maxHealth}
        </span>
      </div>

      {/* Boss身体 */}
      {boss.segments.map((segment, index) => {
        const isHead = index === 0;
        const size = GAME_CONFIG.GRID_SIZE - 2;
        const segPixelX = segment.gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
        const segPixelY = segment.gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              width: size,
              height: size,
              left: segPixelX - size / 2,
              top: segPixelY - size / 2,
              backgroundColor: isParalyzed ? '#6b7280' : '#22c55e',
              boxShadow: `0 0 ${isHead ? 20 : 12}px ${isParalyzed ? '#9ca3af' : '#4ade80'}`,
              zIndex: boss.segments.length - index,
            }}
            animate={{
              scale: isAiming ? [1, 1.05, 1] : 1,
            }}
            transition={{
              scale: { duration: 0.3, repeat: isAiming ? Infinity : 0 },
            }}
          >
            {/* 头部皇冠 */}
            {isHead && (
              <>
                {/* 眼睛 */}
                <div
                  className="absolute w-2 h-2 bg-red-500"
                  style={{ left: 2, top: 3 }}
                />
                <div
                  className="absolute w-2 h-2 bg-red-500"
                  style={{ right: 2, top: 3 }}
                />
                {/* 皇冠 */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '8px solid #fbbf24',
                    filter: 'drop-shadow(0 0 5px #fbbf24)',
                  }}
                />
              </>
            )}
          </motion.div>
        );
      })}

      {/* 瞄准预警 */}
      {isAiming && boss.aimTarget && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: boss.aimTarget.gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2 - 15,
            top: boss.aimTarget.gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2 - 15,
            width: 30,
            height: 30,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        >
          <div
            className="w-full h-full border-2 border-red-500"
            style={{
              boxShadow: '0 0 10px #ef4444, inset 0 0 10px rgba(239, 68, 68, 0.3)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500"
          />
        </motion.div>
      )}
    </>
  );
}
