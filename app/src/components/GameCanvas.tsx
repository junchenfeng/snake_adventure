import { useRef, useEffect, useCallback, useState } from 'react';
import type {
  GameState,
  GridPosition,
  Enemy,
  Boss,
} from '@/types/game';
import { GAME_CONFIG, STORIES } from '@/types/game';
import { useGameLoop } from '@/hooks/useGameLoop';
import { Snake } from './Snake';
import { Fruit } from './Fruit';
import { Shield } from './Shield';
import { Bow } from './Bow';
import { Boss as BossComponent } from './Boss';
import { Arrow } from './Arrow';
import { ExplosiveArrow as ExplosiveArrowComponent } from './ExplosiveArrow';
import { ParticleEffect } from './ParticleEffect';
import { StatusBar } from './StatusBar';
import { StoryModal } from './StoryModal';
import { WhiteFlash } from './WhiteFlash';
import { Pause, Play } from 'lucide-react';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameOver: () => void;
  onVictory: () => void;
}

// 计算两点之间的曼哈顿距离
const manhattanDistance = (a: GridPosition, b: GridPosition): number => {
  return Math.abs(a.gridX - b.gridX) + Math.abs(a.gridY - b.gridY);
};

// 获取方向
const getDirection = (from: GridPosition, to: GridPosition): GridPosition => {
  const dx = to.gridX - from.gridX;
  const dy = to.gridY - from.gridY;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return { gridX: dx > 0 ? 1 : -1, gridY: 0 };
  } else {
    return { gridX: 0, gridY: dy > 0 ? 1 : -1 };
  }
};

export function GameCanvas({ gameState, setGameState, onGameOver, onVictory }: GameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showLevelStory, setShowLevelStory] = useState(false);
  const [levelStoryContent, setLevelStoryContent] = useState('');
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; color: string; type: 'collect' | 'hit' | 'spawn' }>>([]);
  const storyShownRef = useRef<{ [key: number]: boolean }>({});
  const isAimingRef = useRef(false);
  const lastEnemySpawnTime = useRef(0);

  // 添加粒子效果
  const addParticles = useCallback((x: number, y: number, color: string, type: 'collect' | 'hit' | 'spawn' = 'collect') => {
    const newParticles: Array<{ id: string; x: number; y: number; color: string; type: 'collect' | 'hit' | 'spawn' }> = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random().toString(36),
        x,
        y,
        color,
        type,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  // 获取随机网格位置
  const getRandomGridPosition = useCallback((): GridPosition => {
    const margin = 3;
    return {
      gridX: margin + Math.floor(Math.random() * (GAME_CONFIG.GRID_COLS - margin * 2)),
      gridY: margin + Math.floor(Math.random() * (GAME_CONFIG.GRID_ROWS - margin * 2)),
    };
  }, []);

  // 检查位置是否有效
  const isValidGridPosition = useCallback((pos: GridPosition, excludePositions: GridPosition[] = []): boolean => {
    // 检查边界
    if (pos.gridX < 1 || pos.gridX >= GAME_CONFIG.GRID_COLS - 1 || 
        pos.gridY < 1 || pos.gridY >= GAME_CONFIG.GRID_ROWS - 1) {
      return false;
    }
    
    // 检查与玩家蛇的距离
    for (const segment of gameState.player.segments) {
      if (manhattanDistance(pos, segment) < 8) return false;
    }
    
    // 检查与敌人的距离
    for (const enemy of gameState.enemies) {
      for (const segment of enemy.segments) {
        if (manhattanDistance(pos, segment) < 5) return false;
      }
    }
    
    // 检查与Boss的距离
    if (gameState.boss) {
      for (const segment of gameState.boss.segments) {
        if (manhattanDistance(pos, segment) < 8) return false;
      }
    }
    
    // 检查排除位置
    for (const exclude of excludePositions) {
      if (manhattanDistance(pos, exclude) < 3) return false;
    }
    
    return true;
  }, [gameState.player.segments, gameState.enemies, gameState.boss]);

  // 获取有效随机位置
  const getValidRandomGridPosition = useCallback((excludePositions: GridPosition[] = []): GridPosition => {
    let pos = getRandomGridPosition();
    let attempts = 0;
    while (!isValidGridPosition(pos, excludePositions) && attempts < 100) {
      pos = getRandomGridPosition();
      attempts++;
    }
    return pos;
  }, [getRandomGridPosition, isValidGridPosition]);

  // 生成敌人
  const spawnEnemy = useCallback(() => {
    const pos = getValidRandomGridPosition([
      ...gameState.fruits,
      ...gameState.shields,
      ...gameState.bows,
    ]);
    
    const newEnemy: Enemy = {
      id: Math.random().toString(36),
      segments: [
        { gridX: pos.gridX, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() },
        { gridX: pos.gridX - 1, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 1 },
        { gridX: pos.gridX - 2, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 2 },
      ],
      direction: { gridX: 1, gridY: 0 },
      isDead: false,
      deadTime: 0,
      attackCooldown: 0,
      respawnTime: 0,
      moveCooldown: 0,
    };

    setGameState(prev => ({
      ...prev,
      enemies: [...prev.enemies, newEnemy],
    }));
  }, [getValidRandomGridPosition, gameState.fruits, gameState.shields, gameState.bows, setGameState]);

  // 生成Boss
  const spawnBoss = useCallback(() => {
    const pos = { gridX: GAME_CONFIG.GRID_COLS - 5, gridY: Math.floor(GAME_CONFIG.GRID_ROWS / 2) };
    
    const newBoss: Boss = {
      segments: [
        { gridX: pos.gridX, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() },
        { gridX: pos.gridX - 1, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 1 },
        { gridX: pos.gridX - 2, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 2 },
        { gridX: pos.gridX - 3, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 3 },
        { gridX: pos.gridX - 4, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 4 },
      ],
      health: GAME_CONFIG.BOSS_MAX_HEALTH,
      maxHealth: GAME_CONFIG.BOSS_MAX_HEALTH,
      direction: { gridX: -1, gridY: 0 },
      state: 'idle',
      aimTarget: null,
      aimFlashCount: 0,
      lastAimTime: 0,
      paralyzeEndTime: 0,
      lastExplosiveArrowTime: 0,
      moveCooldown: 0,
    };

    setGameState(prev => ({ ...prev, boss: newBoss }));
  }, [setGameState]);

  // 初始化关卡
  useEffect(() => {
    if (!gameState.isPlaying) return;

    if (storyShownRef.current[gameState.level]) return;

    if (gameState.level === 1) {
      setLevelStoryContent(STORIES.level1);
      setShowLevelStory(true);
      storyShownRef.current[1] = true;
    } else if (gameState.level === 2) {
      setLevelStoryContent(STORIES.level2);
      setShowLevelStory(true);
      storyShownRef.current[2] = true;
      // 第2关生成第一个敌人
      spawnEnemy();
    } else if (gameState.level === 3) {
      setLevelStoryContent(STORIES.level3);
      setShowLevelStory(true);
      storyShownRef.current[3] = true;
      // 第3关生成Boss
      spawnBoss();
    }

    // 初始化道具
    const fruits: GridPosition[] = [];
    for (let i = 0; i < 3; i++) {
      const pos = getValidRandomGridPosition(fruits);
      fruits.push(pos);
      addParticles(pos.gridX * GAME_CONFIG.GRID_SIZE + 10, pos.gridY * GAME_CONFIG.GRID_SIZE + 10, '#fbbf24', 'spawn');
    }

    setGameState(prev => ({
      ...prev,
      fruits,
      shields: [getValidRandomGridPosition(fruits)],
      bows: gameState.level >= 2 ? [getValidRandomGridPosition([...fruits, ...prev.shields])] : [],
    }));
  }, [gameState.isPlaying, gameState.level, getValidRandomGridPosition, spawnEnemy, spawnBoss, setGameState, addParticles]);

  // 鼠标移动处理 - 窗口级追踪，不 clamp 以允许边界推撞
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gridX = Math.floor(x / GAME_CONFIG.GRID_SIZE);
      const gridY = Math.floor(y / GAME_CONFIG.GRID_SIZE);
      setGameState(prev => ({
        ...prev,
        mouseGridX: gridX,
        mouseGridY: gridY,
      }));
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [setGameState]);

  // 右键按下（进入子弹时间/瞄准）
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState.player.arrows > 0 && !gameState.isBulletTime) {
      isAimingRef.current = true;
      setGameState(prev => ({ ...prev, isBulletTime: true }));
    }
  }, [gameState.player.arrows, gameState.isBulletTime, setGameState]);

  // 空格键发射 - 使用 window 事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        // 如果正在瞄准，发射箭矢
        if (isAimingRef.current && gameState.isBulletTime) {
          isAimingRef.current = false;
          
          setGameState(prev => {
            if (prev.player.arrows <= 0) {
              return { ...prev, isBulletTime: false };
            }
            
            return {
              ...prev,
              isBulletTime: false,
              flyingArrows: [
                ...prev.flyingArrows,
                {
                  id: Math.random().toString(36),
                  startGridX: prev.player.segments[0].gridX,
                  startGridY: prev.player.segments[0].gridY,
                  targetGridX: Math.max(0, Math.min(GAME_CONFIG.GRID_COLS - 1, prev.mouseGridX)),
                  targetGridY: Math.max(0, Math.min(GAME_CONFIG.GRID_ROWS - 1, prev.mouseGridY)),
                  progress: 0,
                },
              ],
              player: { ...prev.player, arrows: prev.player.arrows - 1 },
            };
          });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isBulletTime, setGameState]);

  // 游戏更新逻辑
  const update = useCallback((deltaTime: number) => {
    if (gameState.isPaused) return;

    setGameState(prev => {
      const newState = { ...prev };
      
      // 更新玩家移动冷却
      newState.player.moveCooldown -= deltaTime;
      
      // 玩家移动（格子移动）
      if (newState.player.moveCooldown <= 0 && !newState.isBulletTime) {
        const head = newState.player.segments[0];
        const targetX = newState.mouseGridX;
        const targetY = newState.mouseGridY;
        
        // 计算移动方向
        const dir = getDirection(head, { gridX: targetX, gridY: targetY });
        
        // 只有当目标位置与当前位置不同时才移动
        if (dir.gridX !== 0 || dir.gridY !== 0) {
          const newGridX = head.gridX + dir.gridX;
          const newGridY = head.gridY + dir.gridY;
          
          const isOutOfBounds = newGridX < 0 || newGridX >= GAME_CONFIG.GRID_COLS ||
                                newGridY < 0 || newGridY >= GAME_CONFIG.GRID_ROWS;
          
          if (isOutOfBounds) {
            // 尝试移出边界：不移动，扣血
            if (!newState.player.isInvincible) {
              if (newState.player.hasShield) {
                newState.player.hasShield = false;
              } else {
                newState.player.health = Math.max(0, newState.player.health - GAME_CONFIG.BOUNDARY_DAMAGE);
              }
              newState.player.isInvincible = true;
              newState.player.invincibleTime = GAME_CONFIG.PLAYER_INVINCIBLE_TIME;
              addParticles(head.gridX * GAME_CONFIG.GRID_SIZE + 10, head.gridY * GAME_CONFIG.GRID_SIZE + 10, '#ef4444', 'hit');
            }
          } else {
            // 正常移动
            for (let i = newState.player.segments.length - 1; i > 0; i--) {
              newState.player.segments[i] = {
                ...newState.player.segments[i - 1],
                id: newState.player.segments[i].id,
              };
            }
            newState.player.segments[0] = {
              ...newState.player.segments[0],
              gridX: newGridX,
              gridY: newGridY,
            };
            newState.player.direction = dir;
            
            // 移动到边界格子时扣血
            const isAtBoundary = newGridX === 0 || newGridX === GAME_CONFIG.GRID_COLS - 1 ||
                                 newGridY === 0 || newGridY === GAME_CONFIG.GRID_ROWS - 1;
            if (isAtBoundary && !newState.player.isInvincible) {
              if (newState.player.hasShield) {
                newState.player.hasShield = false;
              } else {
                newState.player.health = Math.max(0, newState.player.health - GAME_CONFIG.BOUNDARY_DAMAGE);
              }
              newState.player.isInvincible = true;
              newState.player.invincibleTime = GAME_CONFIG.PLAYER_INVINCIBLE_TIME;
              addParticles(newGridX * GAME_CONFIG.GRID_SIZE + 10, newGridY * GAME_CONFIG.GRID_SIZE + 10, '#ef4444', 'hit');
            }
          }
          
          // 重置移动冷却
          newState.player.moveCooldown = 1 / GAME_CONFIG.PLAYER_SPEED;
        }
      }

      // 更新无敌时间
      if (newState.player.isInvincible) {
        newState.player.invincibleTime -= deltaTime;
        if (newState.player.invincibleTime <= 0) {
          newState.player.isInvincible = false;
        }
      }

      // 更新敌人
      newState.enemies = newState.enemies.map(enemy => {
        if (enemy.isDead) {
          enemy.respawnTime -= deltaTime;
          if (enemy.respawnTime <= 0) {
            // 复活 - 生成新位置
            let newPos = getValidRandomGridPosition([
              ...newState.fruits,
              ...newState.shields,
              ...newState.bows,
            ]);
            return {
              ...enemy,
              isDead: false,
              segments: [
                { gridX: newPos.gridX, gridY: newPos.gridY, pixelX: 0, pixelY: 0, id: Date.now() },
                { gridX: newPos.gridX - 1, gridY: newPos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 1 },
                { gridX: newPos.gridX - 2, gridY: newPos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 2 },
              ],
              respawnTime: 0,
              moveCooldown: 0,
            };
          }
          return enemy;
        }

        // 敌人移动
        enemy.moveCooldown -= deltaTime;
        if (enemy.moveCooldown <= 0) {
          const enemyHead = enemy.segments[0];
          const playerHead = newState.player.segments[0];
          
          // 计算移动方向（追踪玩家）
          let dir: GridPosition = { gridX: 0, gridY: 0 };
          const dx = playerHead.gridX - enemyHead.gridX;
          const dy = playerHead.gridY - enemyHead.gridY;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            dir = { gridX: dx > 0 ? 1 : -1, gridY: 0 };
          } else {
            dir = { gridX: 0, gridY: dy > 0 ? 1 : -1 };
          }
          
          const newGridX = enemyHead.gridX + dir.gridX;
          const newGridY = enemyHead.gridY + dir.gridY;
          
          // 检查边界
          if (newGridX >= 0 && newGridX < GAME_CONFIG.GRID_COLS && 
              newGridY >= 0 && newGridY < GAME_CONFIG.GRID_ROWS) {
            // 更新敌人身体
            for (let i = enemy.segments.length - 1; i > 0; i--) {
              enemy.segments[i] = { ...enemy.segments[i - 1], id: enemy.segments[i].id };
            }
            enemy.segments[0] = { ...enemy.segments[0], gridX: newGridX, gridY: newGridY };
            enemy.direction = dir;
          }
          
          enemy.moveCooldown = 1 / GAME_CONFIG.ENEMY_SPEED;
        }

        // 更新攻击冷却
        if (enemy.attackCooldown > 0) {
          enemy.attackCooldown -= deltaTime;
        }

        return enemy;
      });

      // 自然生成敌人（第2关及以上）
      if (newState.level >= 2 && newState.enemies.length < 2) {
        lastEnemySpawnTime.current += deltaTime;
        if (lastEnemySpawnTime.current >= 15) { // 每15秒尝试生成一个敌人
          lastEnemySpawnTime.current = 0;
          if (Math.random() < 0.5) {
            const pos = getValidRandomGridPosition([
              ...newState.fruits,
              ...newState.shields,
              ...newState.bows,
            ]);
            const newEnemy: Enemy = {
              id: Math.random().toString(36),
              segments: [
                { gridX: pos.gridX, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() },
                { gridX: pos.gridX - 1, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 1 },
                { gridX: pos.gridX - 2, gridY: pos.gridY, pixelX: 0, pixelY: 0, id: Date.now() + 2 },
              ],
              direction: { gridX: 1, gridY: 0 },
              isDead: false,
              deadTime: 0,
              attackCooldown: 0,
              respawnTime: 0,
              moveCooldown: 0,
            };
            newState.enemies.push(newEnemy);
          }
        }
      }

      // 更新Boss
      if (newState.boss) {
        const boss = newState.boss;
        
        // 检查瘫痪状态
        if (boss.state === 'paralyzed') {
          if (Date.now() / 1000 >= boss.paralyzeEndTime) {
            boss.state = 'idle';
          }
        } else {
          // Boss移动
          boss.moveCooldown -= deltaTime;
          if (boss.moveCooldown <= 0) {
            const bossHead = boss.segments[0];
            const playerHead = newState.player.segments[0];
            
            // 计算移动方向
            let dir: GridPosition = { gridX: 0, gridY: 0 };
            const dx = playerHead.gridX - bossHead.gridX;
            const dy = playerHead.gridY - bossHead.gridY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
              dir = { gridX: dx > 0 ? 1 : -1, gridY: 0 };
            } else {
              dir = { gridX: 0, gridY: dy > 0 ? 1 : -1 };
            }
            
            const newGridX = bossHead.gridX + dir.gridX;
            const newGridY = bossHead.gridY + dir.gridY;
            
            if (newGridX >= 0 && newGridX < GAME_CONFIG.GRID_COLS && 
                newGridY >= 0 && newGridY < GAME_CONFIG.GRID_ROWS) {
              for (let i = boss.segments.length - 1; i > 0; i--) {
                boss.segments[i] = { ...boss.segments[i - 1], id: boss.segments[i].id };
              }
              boss.segments[0] = { ...boss.segments[0], gridX: newGridX, gridY: newGridY };
              boss.direction = dir;
            }
            
            boss.moveCooldown = 1 / GAME_CONFIG.BOSS_SPEED;
          }

          // 发射爆炸箭
          const now = Date.now() / 1000;
          if (now - boss.lastExplosiveArrowTime >= GAME_CONFIG.BOSS_EXPLOSIVE_ARROW_INTERVAL) {
            boss.lastExplosiveArrowTime = now;
            newState.explosiveArrows.push({
              id: Math.random().toString(36),
              gridX: boss.segments[0].gridX,
              gridY: boss.segments[0].gridY,
              pixelX: 0,
              pixelY: 0,
              targetGridX: newState.player.segments[0].gridX,
              targetGridY: newState.player.segments[0].gridY,
              speed: 5,
            });
          }

          // 瞄准射击
          if (boss.state === 'idle' && Math.random() < 0.005) {
            boss.state = 'aiming';
            boss.aimTarget = { gridX: newState.player.segments[0].gridX, gridY: newState.player.segments[0].gridY };
            boss.lastAimTime = now;
            boss.aimFlashCount = 0;
          }

          // 瞄准闪烁
          if (boss.state === 'aiming') {
            const aimElapsed = now - boss.lastAimTime;
            if (aimElapsed >= 1.5) {
              // 发射箭矢
              boss.state = 'paralyzed';
              boss.paralyzeEndTime = now + GAME_CONFIG.BOSS_PARALYZE_TIME;
              
              // 检查是否命中玩家
              if (boss.aimTarget) {
                const dist = manhattanDistance(newState.player.segments[0], boss.aimTarget);
                if (dist < 2 && !newState.player.isInvincible) {
                  newState.player.health = Math.max(0, newState.player.health - GAME_CONFIG.BOSS_ARROW_DAMAGE);
                  newState.player.isInvincible = true;
                  newState.player.invincibleTime = GAME_CONFIG.PLAYER_INVINCIBLE_TIME;
                }
              }
            }
          }
        }
      }

      // 更新爆炸箭
      newState.explosiveArrows = newState.explosiveArrows.map(arrow => {
        const dx = arrow.targetGridX - arrow.gridX;
        const dy = arrow.targetGridY - arrow.gridY;
        let dir: GridPosition = { gridX: 0, gridY: 0 };
        
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = { gridX: dx > 0 ? 1 : -1, gridY: 0 };
        } else {
          dir = { gridX: 0, gridY: dy > 0 ? 1 : -1 };
        }
        
        arrow.gridX += dir.gridX;
        arrow.gridY += dir.gridY;
        return arrow;
      }).filter(arrow => {
        // 检查是否出界
        if (arrow.gridX < 0 || arrow.gridX >= GAME_CONFIG.GRID_COLS || 
            arrow.gridY < 0 || arrow.gridY >= GAME_CONFIG.GRID_ROWS) {
          return false;
        }
        
        // 检查是否碰到玩家
        const playerHead = newState.player.segments[0];
        if (arrow.gridX === playerHead.gridX && arrow.gridY === playerHead.gridY && !newState.player.isInvincible) {
          newState.player.health = Math.max(0, newState.player.health - GAME_CONFIG.EXPLOSIVE_ARROW_PLAYER_DAMAGE);
          newState.player.isInvincible = true;
          newState.player.invincibleTime = GAME_CONFIG.PLAYER_INVINCIBLE_TIME;
          return false;
        }
        
        // 检查是否碰到Boss
        if (newState.boss) {
          for (const segment of newState.boss.segments) {
            if (arrow.gridX === segment.gridX && arrow.gridY === segment.gridY) {
              newState.boss.health = Math.max(0, newState.boss.health - GAME_CONFIG.EXPLOSIVE_ARROW_BOSS_DAMAGE);
              return false;
            }
          }
        }
        
        return true;
      });

      // 更新飞行箭矢
      newState.flyingArrows = newState.flyingArrows.map(arrow => {
        arrow.progress += deltaTime * 10;
        return arrow;
      }).filter(arrow => {
        if (arrow.progress >= 1) {
          // 检查命中敌人 - 只在目标位置检查
          const hitGridX = arrow.targetGridX;
          const hitGridY = arrow.targetGridY;
          
          newState.enemies = newState.enemies.map(enemy => {
            if (enemy.isDead) return enemy;
            // 检查是否命中敌人头部
            if (hitGridX === enemy.segments[0].gridX && hitGridY === enemy.segments[0].gridY) {
              enemy.isDead = true;
              enemy.deadTime = Date.now() / 1000;
              enemy.respawnTime = GAME_CONFIG.ENEMY_RESPAWN_TIME;
              newState.score += GAME_CONFIG.ENEMY_KILL_SCORE;
            }
            return enemy;
          });
          
          return false;
        }
        return true;
      });

      const playerHead = newState.player.segments[0];

      // 碰撞检测 - 果实
      newState.fruits = newState.fruits.filter(fruit => {
        if (playerHead.gridX === fruit.gridX && playerHead.gridY === fruit.gridY) {
          newState.score += GAME_CONFIG.FRUIT_SCORE;
          // 只加一段身体
          const lastSegment = newState.player.segments[newState.player.segments.length - 1];
          newState.player.segments.push({
            gridX: lastSegment.gridX,
            gridY: lastSegment.gridY,
            pixelX: 0,
            pixelY: 0,
            id: Date.now(),
          });
          // 添加收集粒子效果
          addParticles(fruit.gridX * GAME_CONFIG.GRID_SIZE + 10, fruit.gridY * GAME_CONFIG.GRID_SIZE + 10, '#fbbf24', 'collect');
          return false;
        }
        return true;
      });

      // 碰撞检测 - 护盾
      newState.shields = newState.shields.filter(shield => {
        if (playerHead.gridX === shield.gridX && playerHead.gridY === shield.gridY) {
          newState.player.hasShield = true;
          // 添加收集粒子效果
          addParticles(shield.gridX * GAME_CONFIG.GRID_SIZE + 10, shield.gridY * GAME_CONFIG.GRID_SIZE + 10, '#3b82f6', 'collect');
          return false;
        }
        return true;
      });

      // 碰撞检测 - 弓箭
      newState.bows = newState.bows.filter(bow => {
        if (playerHead.gridX === bow.gridX && playerHead.gridY === bow.gridY) {
          newState.player.arrows++;
          // 添加收集粒子效果
          addParticles(bow.gridX * GAME_CONFIG.GRID_SIZE + 10, bow.gridY * GAME_CONFIG.GRID_SIZE + 10, '#d97706', 'collect');
          return false;
        }
        return true;
      });

      // 碰撞检测 - 敌人攻击玩家
      newState.enemies.forEach(enemy => {
        if (enemy.isDead) return;
        
        // 敌人头部与玩家身体碰撞（玩家击败敌人）
        const enemyHead = enemy.segments[0];
        for (let i = 1; i < newState.player.segments.length; i++) {
          if (enemyHead.gridX === newState.player.segments[i].gridX && 
              enemyHead.gridY === newState.player.segments[i].gridY) {
            enemy.isDead = true;
            enemy.deadTime = Date.now() / 1000;
            enemy.respawnTime = GAME_CONFIG.ENEMY_RESPAWN_TIME;
            newState.score += GAME_CONFIG.ENEMY_KILL_SCORE;
            // 添加击败粒子效果
            addParticles(enemyHead.gridX * GAME_CONFIG.GRID_SIZE + 10, enemyHead.gridY * GAME_CONFIG.GRID_SIZE + 10, '#6b7280', 'hit');
            return;
          }
        }
        
        // 敌人身体任何部分与玩家头部碰撞（玩家受伤）
        if (!newState.player.isInvincible) {
          for (let i = 0; i < enemy.segments.length; i++) {
            if (playerHead.gridX === enemy.segments[i].gridX && 
                playerHead.gridY === enemy.segments[i].gridY) {
              if (newState.player.hasShield) {
                newState.player.hasShield = false;
              } else {
                newState.player.health = Math.max(0, newState.player.health - 1);
              }
              newState.player.isInvincible = true;
              newState.player.invincibleTime = GAME_CONFIG.PLAYER_INVINCIBLE_TIME;
              addParticles(playerHead.gridX * GAME_CONFIG.GRID_SIZE + 10, playerHead.gridY * GAME_CONFIG.GRID_SIZE + 10, '#ef4444', 'hit');
              return;
            }
          }
        }
      });

      // 碰撞检测 - Boss
      if (newState.boss && newState.boss.state !== 'paralyzed') {
        const boss = newState.boss;
        
        // Boss头部与玩家身体碰撞（玩家攻击Boss）
        const bossHead = boss.segments[0];
        for (let i = 1; i < newState.player.segments.length; i++) {
          if (bossHead.gridX === newState.player.segments[i].gridX && 
              bossHead.gridY === newState.player.segments[i].gridY) {
            boss.health = Math.max(0, boss.health - GAME_CONFIG.PLAYER_MELEE_DAMAGE);
            // 添加攻击粒子效果
            addParticles(bossHead.gridX * GAME_CONFIG.GRID_SIZE + 10, bossHead.gridY * GAME_CONFIG.GRID_SIZE + 10, '#22c55e', 'hit');
          }
        }
        
        // Boss身体任何部分与玩家头部碰撞（玩家受伤）
        if (!newState.player.isInvincible) {
          for (let i = 0; i < boss.segments.length; i++) {
            if (playerHead.gridX === boss.segments[i].gridX && 
                playerHead.gridY === boss.segments[i].gridY) {
              if (newState.player.hasShield) {
                newState.player.hasShield = false;
              } else {
                newState.player.health = Math.max(0, newState.player.health - GAME_CONFIG.BOSS_MELEE_DAMAGE);
              }
              newState.player.isInvincible = true;
              newState.player.invincibleTime = GAME_CONFIG.PLAYER_INVINCIBLE_TIME;
              addParticles(playerHead.gridX * GAME_CONFIG.GRID_SIZE + 10, playerHead.gridY * GAME_CONFIG.GRID_SIZE + 10, '#ef4444', 'hit');
              break;
            }
          }
        }
      }

      // 检查关卡升级
      if (newState.level === 1 && newState.score >= GAME_CONFIG.LEVEL1_TARGET) {
        newState.level = 2;
      } else if (newState.level === 2 && newState.score >= GAME_CONFIG.LEVEL2_TARGET) {
        newState.level = 3;
      }

      // 检查游戏结束
      if (newState.player.health <= 0) {
        newState.gameOver = true;
        newState.isPlaying = false;
      }

      // 检查胜利
      if (newState.boss && newState.boss.health <= 0) {
        newState.victory = true;
        newState.isPlaying = false;
      }

      // 自动生成果实（限制数量）
      if (newState.fruits.length < 2 && Math.random() < 0.003) {
        const pos = getValidRandomGridPosition([
          ...newState.fruits,
          ...newState.shields,
          ...newState.bows,
        ]);
        newState.fruits.push(pos);
        addParticles(pos.gridX * GAME_CONFIG.GRID_SIZE + 10, pos.gridY * GAME_CONFIG.GRID_SIZE + 10, '#fbbf24', 'spawn');
      }

      // 自动生成护盾（限制数量）
      if (newState.shields.length < 1 && !newState.player.hasShield && Math.random() < 0.001) {
        const pos = getValidRandomGridPosition([
          ...newState.fruits,
          ...newState.shields,
          ...newState.bows,
        ]);
        newState.shields.push(pos);
        addParticles(pos.gridX * GAME_CONFIG.GRID_SIZE + 10, pos.gridY * GAME_CONFIG.GRID_SIZE + 10, '#3b82f6', 'spawn');
      }

      // 自动生成弓箭（限制数量）
      if (newState.level >= 2 && newState.bows.length < 1 && Math.random() < 0.0005) {
        const pos = getValidRandomGridPosition([
          ...newState.fruits,
          ...newState.shields,
          ...newState.bows,
        ]);
        newState.bows.push(pos);
        addParticles(pos.gridX * GAME_CONFIG.GRID_SIZE + 10, pos.gridY * GAME_CONFIG.GRID_SIZE + 10, '#d97706', 'spawn');
      }

      return newState;
    });
  }, [gameState.isPaused, getValidRandomGridPosition, addParticles, setGameState]);

  // 渲染
  const render = useCallback(() => {}, []);

  const { start, stop } = useGameLoop({ onUpdate: update, onRender: render });

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [gameState.isPlaying, gameState.isPaused, start, stop]);

  // 游戏结束处理
  useEffect(() => {
    if (gameState.gameOver) {
      onGameOver();
    }
  }, [gameState.gameOver, onGameOver]);

  // 胜利处理
  useEffect(() => {
    if (gameState.victory) {
      onVictory();
    }
  }, [gameState.victory, onVictory]);

  return (
    <div className="relative">
      {/* 状态栏 */}
      <StatusBar player={gameState.player} />

      {/* 游戏画布 */}
      <div
        ref={canvasRef}
        className="relative mx-auto rounded-xl overflow-hidden cursor-crosshair"
        style={{
          width: GAME_CONFIG.CANVAS_WIDTH,
          height: GAME_CONFIG.CANVAS_HEIGHT,
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          border: '4px solid #0f3460',
          boxShadow: '0 0 40px rgba(15, 52, 96, 0.5), inset 0 0 100px rgba(0, 0, 0, 0.3)',
        }}
        onContextMenu={handleContextMenu}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: `${GAME_CONFIG.GRID_SIZE}px ${GAME_CONFIG.GRID_SIZE}px`,
          }}
        />

        {/* 像素森林背景 */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {[...Array(15)].map((_, i) => (
              <polygon
                key={i}
                points={`${50 + i * 55},600 ${75 + i * 55},${400 + (i % 3) * 30} ${100 + i * 55},600`}
                fill="#064e3b"
              />
            ))}
          </svg>
        </div>

        {/* 粒子效果 */}
        {particles.map(particle => (
          <ParticleEffect
            key={particle.id}
            x={particle.x}
            y={particle.y}
            color={particle.color}
            type={particle.type}
          />
        ))}

        {/* 玩家蛇 */}
        <Snake
          segments={gameState.player.segments}
          isInvincible={gameState.player.isInvincible}
          isPlayer={true}
        />

        {/* 敌人蛇 */}
        {gameState.enemies.map(enemy => (
          <Snake
            key={enemy.id}
            segments={enemy.segments}
            isPlayer={false}
            color={enemy.isDead ? '#9ca3af' : '#6b7280'}
            glowColor={enemy.isDead ? '#d1d5db' : '#4b5563'}
          />
        ))}

        {/* Boss */}
        {gameState.boss && <BossComponent boss={gameState.boss} />}

        {/* 果实 */}
        {gameState.fruits.map((fruit, i) => (
          <Fruit key={i} gridX={fruit.gridX} gridY={fruit.gridY} />
        ))}

        {/* 护盾 */}
        {gameState.shields.map((shield, i) => (
          <Shield key={i} gridX={shield.gridX} gridY={shield.gridY} />
        ))}

        {/* 弓箭 */}
        {gameState.bows.map((bow, i) => (
          <Bow key={i} gridX={bow.gridX} gridY={bow.gridY} />
        ))}

        {/* 飞行箭矢 */}
        {gameState.flyingArrows.map(arrow => (
          <Arrow
            key={arrow.id}
            startGridX={arrow.startGridX}
            startGridY={arrow.startGridY}
            targetGridX={arrow.targetGridX}
            targetGridY={arrow.targetGridY}
            progress={arrow.progress}
          />
        ))}

        {/* 爆炸箭 */}
        {gameState.explosiveArrows.map(arrow => (
          <ExplosiveArrowComponent
            key={arrow.id}
            gridX={arrow.gridX}
            gridY={arrow.gridY}
          />
        ))}

        {/* 子弹时间效果 */}
        {gameState.isBulletTime && (
          <div
            className="absolute inset-0 bg-black/50 pointer-events-none"
            style={{
              backdropFilter: 'blur(2px)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold text-center">
              <div>子弹时间 - 瞄准中</div>
              <div className="text-lg mt-2 text-gray-300">按空格键发射</div>
            </div>
          </div>
        )}

        {/* 分数显示 */}
        <div
          className="absolute top-4 right-4 px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(22, 33, 62, 0.8)',
            border: '2px solid #fbbf24',
          }}
        >
          <span className="text-amber-400 font-bold text-xl">
            分数: {gameState.score}
          </span>
        </div>

        {/* 关卡显示 */}
        <div
          className="absolute top-4 left-4 px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(22, 33, 62, 0.8)',
            border: '2px solid #22c55e',
          }}
        >
          <span className="text-green-400 font-bold">
            第 {gameState.level} 关
          </span>
        </div>

        {/* 暂停按钮 */}
        <button
          onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          style={{
            background: 'rgba(22, 33, 62, 0.8)',
            border: '2px solid #60a5fa',
          }}
        >
          {gameState.isPaused ? (
            <Play className="w-5 h-5 text-blue-400" />
          ) : (
            <Pause className="w-5 h-5 text-blue-400" />
          )}
        </button>

        {/* 操作提示 */}
        <div
          className="absolute bottom-4 left-4 px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(22, 33, 62, 0.8)',
            border: '1px solid #6b7280',
            color: '#9ca3af',
          }}
        >
          <div>鼠标移动: 控制方向</div>
          <div>右键: 瞄准</div>
          <div>空格: 发射</div>
        </div>
      </div>

      {/* 关卡故事弹窗 */}
      <StoryModal
        isOpen={showLevelStory}
        content={levelStoryContent}
        onClose={() => setShowLevelStory(false)}
      />

      {/* 白屏效果 */}
      {gameState.whiteFlashDuration > 0 && (
        <WhiteFlash
          duration={gameState.whiteFlashDuration}
          onComplete={() => setGameState(prev => ({ ...prev, whiteFlashDuration: 0 }))}
        />
      )}
    </div>
  );
}
