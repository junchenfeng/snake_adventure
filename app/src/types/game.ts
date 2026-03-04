// 游戏类型定义

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  gridX: number;
  gridY: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Size {}

export interface SnakeSegment extends GridPosition {
  id: number;
  pixelX: number;
  pixelY: number;
}

export interface Player {
  segments: SnakeSegment[];
  health: number;
  maxHealth: number;
  hasShield: boolean;
  arrows: number;
  direction: GridPosition;
  isInvincible: boolean;
  invincibleTime: number;
  moveCooldown: number;
}

export interface Enemy {
  id: string;
  segments: SnakeSegment[];
  direction: GridPosition;
  isDead: boolean;
  deadTime: number;
  attackCooldown: number;
  respawnTime: number;
  moveCooldown: number;
}

export interface Boss {
  segments: SnakeSegment[];
  health: number;
  maxHealth: number;
  direction: GridPosition;
  state: 'idle' | 'aiming' | 'attacking' | 'paralyzed';
  aimTarget: GridPosition | null;
  aimFlashCount: number;
  lastAimTime: number;
  paralyzeEndTime: number;
  lastExplosiveArrowTime: number;
  moveCooldown: number;
}

export interface ExplosiveArrowType {
  id: string;
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
  targetGridX: number;
  targetGridY: number;
  speed: number;
}

export interface FlyingArrow {
  id: string;
  startGridX: number;
  startGridY: number;
  targetGridX: number;
  targetGridY: number;
  progress: number;
}

export interface GameState {
  // 游戏状态
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
  level: 1 | 2 | 3;
  score: number;
  
  // 玩家
  player: Player;
  
  // 敌人
  enemies: Enemy[];
  boss: Boss | null;
  
  // 道具（使用网格坐标）
  fruits: GridPosition[];
  shields: GridPosition[];
  bows: GridPosition[];
  
  // 箭矢
  explosiveArrows: ExplosiveArrowType[];
  flyingArrows: FlyingArrow[];
  
  // 特效状态
  isBulletTime: boolean;
  bulletTimeTarget: GridPosition | null;
  whiteFlashDuration: number;
  whiteFlashStartTime: number;
  
  // 鼠标网格位置
  mouseGridX: number;
  mouseGridY: number;
  
  // 游戏时间
  gameTime: number;
  
  // 故事显示
  showStory: boolean;
  storyContent: string;
}

export interface GameConfig {
  // 网格设置
  GRID_SIZE: number;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  GRID_COLS: number;
  GRID_ROWS: number;
  
  // 移动速度（格/秒）
  PLAYER_SPEED: number;
  ENEMY_SPEED: number;
  BOSS_SPEED: number;
  
  // 游戏数值
  PLAYER_MAX_HEALTH: number;
  BOSS_MAX_HEALTH: number;
  ENEMY_LENGTH: number;
  BOSS_LENGTH: number;
  
  // 分数
  FRUIT_SCORE: number;
  ENEMY_KILL_SCORE: number;
  LEVEL1_TARGET: number;
  LEVEL2_TARGET: number;
  
  // 冷却时间
  ENEMY_RESPAWN_TIME: number;
  ENEMY_ATTACK_COOLDOWN: number;
  BOSS_PARALYZE_TIME: number;
  BOSS_EXPLOSIVE_ARROW_INTERVAL: number;
  PLAYER_INVINCIBLE_TIME: number;
  
  // 伤害
  BOSS_ARROW_DAMAGE: number;
  BOSS_MELEE_DAMAGE: number;
  EXPLOSIVE_ARROW_PLAYER_DAMAGE: number;
  EXPLOSIVE_ARROW_BOSS_DAMAGE: number;
  PLAYER_MELEE_DAMAGE: number;
  BOUNDARY_DAMAGE: number;
}

export const GAME_CONFIG: GameConfig = {
  GRID_SIZE: 20,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  GRID_COLS: 40,  // 800 / 20
  GRID_ROWS: 30,  // 600 / 20
  
  PLAYER_SPEED: 10,  // 10格/秒
  ENEMY_SPEED: 3,
  BOSS_SPEED: 2,
  
  PLAYER_MAX_HEALTH: 10,
  BOSS_MAX_HEALTH: 20,
  ENEMY_LENGTH: 3,
  BOSS_LENGTH: 5,
  
  FRUIT_SCORE: 10,
  ENEMY_KILL_SCORE: 20,
  LEVEL1_TARGET: 50,
  LEVEL2_TARGET: 100,
  
  ENEMY_RESPAWN_TIME: 10,
  ENEMY_ATTACK_COOLDOWN: 1,
  BOSS_PARALYZE_TIME: 3,
  BOSS_EXPLOSIVE_ARROW_INTERVAL: 20,
  PLAYER_INVINCIBLE_TIME: 0.5,
  
  BOSS_ARROW_DAMAGE: 1,
  BOSS_MELEE_DAMAGE: 1,
  EXPLOSIVE_ARROW_PLAYER_DAMAGE: 2,
  EXPLOSIVE_ARROW_BOSS_DAMAGE: 10,
  PLAYER_MELEE_DAMAGE: 2,
  BOUNDARY_DAMAGE: 1,
};

// 故事内容
export const STORIES = {
  intro: `序章：宁静的打破

在很久很久以前，数码世界边缘有一片宁静的像素森林。
这里的一切都由发光的方块组成。

你是赤焰（Red），一条红色的幼龙蛇，
也是这片森林最后的守护者。
传说中，只有你能驾驭'光标'的力量。

突然有一天，森林的色彩开始褪色，灰色病毒入侵了这里。
为了保护家园，你必须吃下金色的能量果实让自己变强。

长老说："小心，森林深处那个绿色的影子正在注视着你……"`,

  level1: `第一阶段：试炼

吃果实：赤焰正在积攒能量，准备迎接大战。
获得护盾：这是森林对勇气的奖励，蔚蓝护盾将为你抵挡一次致命的伤害。
满50分：能量积攒完毕，赤焰感觉到了远处敌人的气息，它冲向了森林深处。`,

  level2: `第二阶段：暗影军团

警告！暗影军团已到达！
那些灰色的影子是没有灵魂的傀儡，它们不知疲倦，就算被打散，10秒后也会被黑暗力量重组复活。
但你发现了古老的遗物——时之弓。当你拉开弓弦时，整个世界的时间都会为你静止。
利用这份力量，瞄准影子的弱点，杀出一条血路！`,

  level3: `决战：翠毒魔王

大地在震动……它来了。
翠毒魔王盘踞在地图边缘，它曾是森林的守护者，却被病毒腐蚀。

赤焰，听好了：
1. 当它闪烁时，那是箭雨落下的前兆，快躲开！
2. 利用它释放的爆炸箭！引诱爆炸箭撞向魔王自己，那是击败它的关键！
3. 当它发射完一轮攻击陷入疲惫时，就是你反击的时刻！`,

  ending: `终章：光的代价

白光散去，耳边的嗡鸣声逐渐消失。
翠毒魔王的身影不见了，灰色的病毒也随之消散。
你看到森林的方块正在一点点恢复色彩。

赤焰缓缓地闭上了眼睛，
它的红色鳞片因为刚才的冲击而有些发白。
它很累，但它知道，像素森林安全了。

你不仅是幸存者，你是真正的传说。`
};
