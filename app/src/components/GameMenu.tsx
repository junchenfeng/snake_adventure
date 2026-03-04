import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, HelpCircle } from 'lucide-react';

interface GameMenuProps {
  onStart: () => void;
  onShowStory: () => void;
  onShowHelp: () => void;
}

export function GameMenu({ onStart, onShowStory, onShowHelp }: GameMenuProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* 背景装饰 - 像素星星 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 像素森林剪影 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
        <svg viewBox="0 0 800 100" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,100 L0,60 L20,40 L40,70 L60,30 L80,60 L100,20 L120,50 L140,35 L160,65 L180,25 L200,55 L220,40 L240,70 L260,30 L280,60 L300,20 L320,50 L340,35 L360,65 L380,25 L400,55 L420,40 L440,70 L460,30 L480,60 L500,20 L520,50 L540,35 L560,65 L580,25 L600,55 L620,40 L640,70 L660,30 L680,60 L700,20 L720,50 L740,35 L760,65 L780,25 L800,55 L800,100 Z"
            fill="#0f3460"
          />
        </svg>
      </div>

      {/* 标题 */}
      <motion.div
        className="text-center mb-12 z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4"
          style={{
            fontFamily: '"ZCOOL KuaiLe", cursive',
            color: '#e94560',
            textShadow: '0 0 20px #e94560, 0 0 40px #e94560, 4px 4px 0 #8b1538',
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          像素森林
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl"
          style={{
            fontFamily: '"Orbitron", sans-serif',
            color: '#fbbf24',
            textShadow: '0 0 10px #fbbf24',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          赤焰的远征
        </motion.h2>
        <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: '"Orbitron", sans-serif' }}>
          Pixel Forest: Red Flame's Journey
        </p>
      </motion.div>

      {/* 按钮组 */}
      <motion.div
        className="flex flex-col gap-4 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onStart}
            className="w-48 h-14 text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #e94560 0%, #8b1538 100%)',
              border: '3px solid #fbbf24',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(233, 69, 96, 0.5)',
              fontFamily: '"ZCOOL KuaiLe", cursive',
            }}
          >
            <Play className="mr-2" />
            开始冒险
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onShowStory}
            variant="outline"
            className="w-48 h-12 text-lg"
            style={{
              border: '3px solid #60a5fa',
              borderRadius: '12px',
              color: '#60a5fa',
              fontFamily: '"ZCOOL KuaiLe", cursive',
            }}
          >
            <BookOpen className="mr-2" />
            故事背景
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onShowHelp}
            variant="outline"
            className="w-48 h-12 text-lg"
            style={{
              border: '3px solid #4ade80',
              borderRadius: '12px',
              color: '#4ade80',
              fontFamily: '"ZCOOL KuaiLe", cursive',
            }}
          >
            <HelpCircle className="mr-2" />
            操作说明
          </Button>
        </motion.div>
      </motion.div>

      {/* 装饰性像素蛇 */}
      <motion.div
        className="absolute bottom-20 left-10 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={{
              backgroundColor: i === 0 ? '#ef4444' : '#dc2626',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
