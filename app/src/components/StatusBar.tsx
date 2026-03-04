import { motion } from 'framer-motion';
import { Heart, Shield, Crosshair } from 'lucide-react';
import type { Player } from '@/types/game';

interface StatusBarProps {
  player: Player;
}

export function StatusBar({ player }: StatusBarProps) {
  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-4 rounded-xl z-20"
      style={{
        background: 'rgba(22, 33, 62, 0.9)',
        border: '2px solid #0f3460',
        boxShadow: '0 0 20px rgba(15, 52, 96, 0.5)',
      }}
    >
      {/* 生命值 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 mb-1">生命值</span>
        <div className="flex flex-col gap-1">
          {Array.from({ length: player.maxHealth }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Heart
                className={`w-5 h-5 ${
                  i < player.health
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-600'
                }`}
                style={{
                  filter: i < player.health ? 'drop-shadow(0 0 5px #ef4444)' : 'none',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 分割线 */}
      <div className="w-full h-px bg-gray-700" />

      {/* 护盾状态 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 mb-1">护盾</span>
        <motion.div
          animate={player.hasShield ? {
            scale: [1, 1.1, 1],
            filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Shield
            className={`w-8 h-8 ${
              player.hasShield
                ? 'text-blue-400 fill-blue-400'
                : 'text-gray-600'
            }`}
            style={{
              filter: player.hasShield ? 'drop-shadow(0 0 10px #3b82f6)' : 'none',
            }}
          />
        </motion.div>
      </div>

      {/* 分割线 */}
      <div className="w-full h-px bg-gray-700" />

      {/* 箭矢数量 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 mb-1">箭矢</span>
        <div className="flex items-center gap-2">
          <Crosshair
            className={`w-6 h-6 ${
              player.arrows > 0
                ? 'text-amber-400'
                : 'text-gray-600'
            }`}
            style={{
              filter: player.arrows > 0 ? 'drop-shadow(0 0 5px #fbbf24)' : 'none',
            }}
          />
          <span
            className="text-xl font-bold"
            style={{
              color: player.arrows > 0 ? '#fbbf24' : '#6b7280',
            }}
          >
            {player.arrows}
          </span>
        </div>
      </div>

      {/* 分割线 */}
      <div className="w-full h-px bg-gray-700" />

      {/* 蛇长度 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 mb-1">长度</span>
        <span className="text-xl font-bold text-green-400">
          {player.segments.length}
        </span>
      </div>
    </div>
  );
}
