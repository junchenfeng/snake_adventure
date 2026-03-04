import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameMenu } from '@/components/GameMenu';
import { GameCanvas } from '@/components/GameCanvas';
import { StoryModal } from '@/components/StoryModal';
import { WhiteFlash } from '@/components/WhiteFlash';
import type { GameState } from '@/types/game';
import { STORIES, GAME_CONFIG } from '@/types/game';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';

type Screen = 'menu' | 'game' | 'gameover' | 'victory';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [showIntroStory, setShowIntroStory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const storyShownRef = useRef<{ [key: number]: boolean }>({});

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    victory: false,
    level: 1,
    score: 0,
    player: {
      segments: [
        { gridX: 20, gridY: 15, pixelX: 0, pixelY: 0, id: 0 },
        { gridX: 19, gridY: 15, pixelX: 0, pixelY: 0, id: 1 },
        { gridX: 18, gridY: 15, pixelX: 0, pixelY: 0, id: 2 },
      ],
      health: GAME_CONFIG.PLAYER_MAX_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
      hasShield: false,
      arrows: 0,
      direction: { gridX: 1, gridY: 0 },
      isInvincible: false,
      invincibleTime: 0,
      moveCooldown: 0,
    },
    enemies: [],
    boss: null,
    fruits: [],
    shields: [],
    bows: [],
    explosiveArrows: [],
    flyingArrows: [],
    isBulletTime: false,
    bulletTimeTarget: null,
    whiteFlashDuration: 0,
    whiteFlashStartTime: 0,
    mouseGridX: 20,
    mouseGridY: 15,
    gameTime: 0,
    showStory: false,
    storyContent: '',
  });

  // 开始游戏
  const handleStart = useCallback(() => {
    setShowIntroStory(true);
  }, []);

  // 开始实际游戏
  const startActualGame = useCallback(() => {
    setShowIntroStory(false);
    setScreen('game');
    // 重置故事显示状态
    storyShownRef.current = {};
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      victory: false,
      level: 1,
      score: 0,
      player: {
        segments: [
          { gridX: 20, gridY: 15, pixelX: 0, pixelY: 0, id: 0 },
          { gridX: 19, gridY: 15, pixelX: 0, pixelY: 0, id: 1 },
          { gridX: 18, gridY: 15, pixelX: 0, pixelY: 0, id: 2 },
        ],
        health: GAME_CONFIG.PLAYER_MAX_HEALTH,
        maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
        hasShield: false,
        arrows: 0,
        direction: { gridX: 1, gridY: 0 },
        isInvincible: false,
        invincibleTime: 0,
        moveCooldown: 0,
      },
      enemies: [],
      boss: null,
      fruits: [],
      shields: [],
      bows: [],
      explosiveArrows: [],
      flyingArrows: [],
      mouseGridX: 20,
      mouseGridY: 15,
    }));
  }, []);

  // 显示故事背景
  const handleShowStory = useCallback(() => {
    setShowIntroStory(true);
  }, []);

  // 显示帮助
  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  // 游戏结束
  const handleGameOver = useCallback(() => {
    setFinalScore(gameState.score);
    setScreen('gameover');
  }, [gameState.score]);

  // 游戏胜利
  const handleVictory = useCallback(() => {
    setFinalScore(gameState.score);
    setShowWhiteFlash(true);
    
    // 3秒后显示结局
    setTimeout(() => {
      setShowWhiteFlash(false);
      setScreen('victory');
    }, 3000);
  }, [gameState.score]);

  // 返回菜单
  const handleReturnToMenu = useCallback(() => {
    setScreen('menu');
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // 重新开始
  const handleRestart = useCallback(() => {
    startActualGame();
  }, [startActualGame]);

  // 关闭开场故事
  const handleCloseIntroStory = useCallback(() => {
    setShowIntroStory(false);
    startActualGame();
  }, [startActualGame]);

  return (
    <div className="min-h-screen" style={{ background: '#1a1a2e' }}>
      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameMenu
              onStart={handleStart}
              onShowStory={handleShowStory}
              onShowHelp={handleShowHelp}
            />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            className="min-h-screen flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameCanvas
              gameState={gameState}
              setGameState={setGameState}
              onGameOver={handleGameOver}
              onVictory={handleVictory}
            />
          </motion.div>
        )}

        {screen === 'gameover' && (
          <motion.div
            key="gameover"
            className="min-h-screen flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #450a0a 100%)' }}
          >
            <motion.h1
              className="text-6xl font-bold mb-4"
              style={{
                fontFamily: '"ZCOOL KuaiLe", cursive',
                color: '#ef4444',
                textShadow: '0 0 20px #ef4444',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              游戏结束
            </motion.h1>
            <p className="text-2xl text-gray-300 mb-2">最终分数</p>
            <p className="text-5xl font-bold text-amber-400 mb-8">{finalScore}</p>
            
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleRestart}
                  className="w-40 h-12 text-lg cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #e94560 0%, #8b1538 100%)',
                    border: '2px solid #fbbf24',
                  }}
                >
                  <RotateCcw className="mr-2" />
                  再试一次
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleReturnToMenu}
                  variant="outline"
                  className="w-40 h-12 text-lg cursor-pointer"
                  style={{ border: '2px solid #60a5fa', color: '#60a5fa' }}
                >
                  <Home className="mr-2" />
                  返回菜单
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === 'victory' && (
          <motion.div
            key="victory"
            className="min-h-screen flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #064e3b 100%)' }}
          >
            <motion.div
              className="max-w-2xl text-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h1
                className="text-5xl font-bold mb-6"
                style={{
                  fontFamily: '"ZCOOL KuaiLe", cursive',
                  color: '#4ade80',
                  textShadow: '0 0 20px #4ade80',
                }}
              >
                胜利！
              </h1>
              
              <pre
                className="whitespace-pre-wrap text-lg leading-relaxed mb-8"
                style={{
                  fontFamily: '"Noto Sans SC", sans-serif',
                  color: '#f9fafb',
                }}
              >
                {STORIES.ending}
              </pre>
              
              <p className="text-2xl text-amber-400 mb-8">
                最终分数: {finalScore}
              </p>
              
              <div className="flex gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleRestart}
                    className="w-40 h-12 text-lg cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                      border: '2px solid #fbbf24',
                    }}
                  >
                    <RotateCcw className="mr-2" />
                    再次冒险
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleReturnToMenu}
                    variant="outline"
                    className="w-40 h-12 text-lg cursor-pointer"
                    style={{ border: '2px solid #60a5fa', color: '#60a5fa' }}
                  >
                    <Home className="mr-2" />
                    返回菜单
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 开场故事弹窗 */}
      <StoryModal
        isOpen={showIntroStory}
        content={STORIES.intro}
        onClose={handleCloseIntroStory}
      />

      {/* 帮助弹窗 */}
      <StoryModal
        isOpen={showHelp}
        content={`操作说明

【基本操作】
- 鼠标移动：控制赤焰移动方向
- 右键按住：进入子弹时间/瞄准
- 空格键：发射箭矢

【游戏目标】
- 第1关：收集果实达到50分
- 第2关：击败灰色小蛇，达到100分
- 第3关：击败翠毒魔王

【战斗机制】
- 用身体撞击敌人头部：击败敌人
- 敌人尾巴甩中你：受到伤害
- 碰到边界：受到伤害
- 护盾可以抵消一次伤害

【Boss战技巧】
- 躲避红色预警区域
- 引诱爆炸箭撞向Boss
- Boss瘫痪时（变灰）是攻击时机`}
        onClose={() => setShowHelp(false)}
      />

      {/* 胜利白屏 */}
      {showWhiteFlash && <WhiteFlash duration={3} />}
    </div>
  );
}

export default App;
