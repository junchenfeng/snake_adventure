import { useState, useCallback, useRef } from 'react';
import type {
  GameState,
  Player,
  GridPosition,
  FlyingArrow,
} from '@/types/game';
import { GAME_CONFIG, STORIES } from '@/types/game';

const createInitialPlayer = (): Player => ({
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
});

const createInitialState = (): GameState => ({
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  victory: false,
  level: 1,
  score: 0,
  player: createInitialPlayer(),
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
  showStory: true,
  storyContent: STORIES.intro,
});

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState());
  const stateRef = useRef(state);

  // 更新状态引用
  const updateStateRef = useCallback((newState: GameState) => {
    stateRef.current = newState;
    setState(newState);
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    updateStateRef({
      ...createInitialState(),
      isPlaying: true,
      showStory: true,
      storyContent: STORIES.intro,
    });
  }, [updateStateRef]);

  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // 更新鼠标网格位置
  const updateMouseGridPosition = useCallback((gridX: number, gridY: number) => {
    setState(prev => ({ ...prev, mouseGridX: gridX, mouseGridY: gridY }));
  }, []);

  // 显示故事
  const showStory = useCallback((content: string) => {
    setState(prev => ({ ...prev, showStory: true, storyContent: content }));
  }, []);

  // 关闭故事
  const closeStory = useCallback(() => {
    setState(prev => ({ ...prev, showStory: false }));
  }, []);

  // 进入子弹时间
  const enterBulletTime = useCallback(() => {
    setState(prev => ({ ...prev, isBulletTime: true }));
  }, []);

  // 退出子弹时间
  const exitBulletTime = useCallback((target: GridPosition) => {
    setState(prev => ({
      ...prev,
      isBulletTime: false,
      bulletTimeTarget: target,
    }));
  }, []);

  // 触发白屏
  const triggerWhiteFlash = useCallback((duration: number) => {
    setState(prev => ({
      ...prev,
      whiteFlashDuration: duration,
      whiteFlashStartTime: Date.now(),
    }));
  }, []);

  // 更新游戏状态（每帧调用）
  const updateGame = useCallback((deltaTime: number) => {
    setState(prev => {
      const newState = { ...prev, gameTime: prev.gameTime + deltaTime };
      
      // 更新白屏效果
      if (newState.whiteFlashDuration > 0) {
        const elapsed = (Date.now() - newState.whiteFlashStartTime) / 1000;
        if (elapsed >= newState.whiteFlashDuration) {
          newState.whiteFlashDuration = 0;
        }
      }

      // 更新玩家无敌时间
      if (newState.player.isInvincible) {
        newState.player.invincibleTime -= deltaTime;
        if (newState.player.invincibleTime <= 0) {
          newState.player.isInvincible = false;
        }
      }

      return newState;
    });
  }, []);

  // 玩家受伤
  const damagePlayer = useCallback((damage: number) => {
    setState(prev => {
      if (prev.player.isInvincible) return prev;

      let newHealth = prev.player.health;
      let newHasShield = prev.player.hasShield;

      if (prev.player.hasShield) {
        newHasShield = false;
      } else {
        newHealth = Math.max(0, prev.player.health - damage);
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          health: newHealth,
          hasShield: newHasShield,
          isInvincible: true,
          invincibleTime: GAME_CONFIG.PLAYER_INVINCIBLE_TIME,
        },
        gameOver: newHealth <= 0,
      };
    });
  }, []);

  // 添加分数
  const addScore = useCallback((points: number) => {
    setState(prev => {
      const newScore = prev.score + points;
      let newLevel = prev.level;

      // 检查升级
      if (prev.level === 1 && newScore >= GAME_CONFIG.LEVEL1_TARGET) {
        newLevel = 2;
      } else if (prev.level === 2 && newScore >= GAME_CONFIG.LEVEL2_TARGET) {
        newLevel = 3;
      }

      return { ...prev, score: newScore, level: newLevel };
    });
  }, []);

  // 收集果实
  const collectFruit = useCallback((index: number) => {
    setState(prev => {
      const newFruits = [...prev.fruits];
      newFruits.splice(index, 1);
      return { ...prev, fruits: newFruits };
    });
    addScore(GAME_CONFIG.FRUIT_SCORE);
  }, [addScore]);

  // 收集护盾
  const collectShield = useCallback((index: number) => {
    setState(prev => {
      const newShields = [...prev.shields];
      newShields.splice(index, 1);
      return {
        ...prev,
        shields: newShields,
        player: { ...prev.player, hasShield: true },
      };
    });
  }, []);

  // 收集弓箭
  const collectBow = useCallback((index: number) => {
    setState(prev => {
      const newBows = [...prev.bows];
      newBows.splice(index, 1);
      return {
        ...prev,
        bows: newBows,
        player: { ...prev.player, arrows: prev.player.arrows + 1 },
      };
    });
  }, []);

  // 生成果实
  const spawnFruit = useCallback(() => {
    setState(prev => {
      if (prev.fruits.length >= 3) return prev;
      
      const gridX = Math.floor(Math.random() * GAME_CONFIG.GRID_COLS);
      const gridY = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS);
      
      return {
        ...prev,
        fruits: [...prev.fruits, { gridX, gridY }],
      };
    });
  }, []);

  // 生成护盾
  const spawnShield = useCallback(() => {
    setState(prev => {
      if (prev.shields.length >= 1 || prev.player.hasShield) return prev;
      
      const gridX = Math.floor(Math.random() * GAME_CONFIG.GRID_COLS);
      const gridY = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS);
      
      return {
        ...prev,
        shields: [...prev.shields, { gridX, gridY }],
      };
    });
  }, []);

  // 生成弓箭
  const spawnBow = useCallback(() => {
    setState(prev => {
      if (prev.bows.length >= 1) return prev;
      
      const gridX = Math.floor(Math.random() * GAME_CONFIG.GRID_COLS);
      const gridY = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS);
      
      return {
        ...prev,
        bows: [...prev.bows, { gridX, gridY }],
      };
    });
  }, []);

  // 发射箭矢
  const shootArrow = useCallback((target: GridPosition) => {
    setState(prev => {
      if (prev.player.arrows <= 0) return prev;

      const newArrow: FlyingArrow = {
        id: Math.random().toString(36),
        startGridX: prev.player.segments[0].gridX,
        startGridY: prev.player.segments[0].gridY,
        targetGridX: target.gridX,
        targetGridY: target.gridY,
        progress: 0,
      };

      return {
        ...prev,
        flyingArrows: [...prev.flyingArrows, newArrow],
        player: { ...prev.player, arrows: prev.player.arrows - 1 },
      };
    });
  }, []);

  // 更新箭矢
  const updateFlyingArrows = useCallback((deltaTime: number) => {
    setState(prev => {
      const newArrows = prev.flyingArrows
        .map(arrow => ({
          ...arrow,
          progress: arrow.progress + deltaTime * 5,
        }))
        .filter(arrow => arrow.progress < 1);

      return { ...prev, flyingArrows: newArrows };
    });
  }, []);

  // 设置胜利
  const setVictory = useCallback(() => {
    setState(prev => ({ ...prev, victory: true, isPlaying: false }));
  }, []);

  return {
    state,
    stateRef,
    startGame,
    togglePause,
    updateMouseGridPosition,
    showStory,
    closeStory,
    enterBulletTime,
    exitBulletTime,
    triggerWhiteFlash,
    updateGame,
    damagePlayer,
    addScore,
    collectFruit,
    collectShield,
    collectBow,
    spawnFruit,
    spawnShield,
    spawnBow,
    shootArrow,
    updateFlyingArrows,
    setVictory,
  };
}
