# 像素森林：赤焰的远征 - 技术规范

---

## 组件清单

### shadcn/ui 组件
- `button` - 游戏按钮
- `dialog` - 弹窗（故事、提示）
- `progress` - 血量条
- `card` - 状态卡片

### 自定义组件

| 组件名 | 用途 | 位置 |
|--------|------|------|
| GameCanvas | 游戏画布 | components/GameCanvas.tsx |
| Snake | 蛇角色渲染 | components/Snake.tsx |
| Fruit | 果实道具 | components/Fruit.tsx |
| Shield | 护盾道具 | components/Shield.tsx |
| Bow | 弓箭道具 | components/Bow.tsx |
| Enemy | 敌人蛇 | components/Enemy.tsx |
| Boss | Boss角色 | components/Boss.tsx |
| Arrow | 箭矢 | components/Arrow.tsx |
| ExplosiveArrow | 爆炸箭 | components/ExplosiveArrow.tsx |
| StatusBar | 左侧状态栏 | components/StatusBar.tsx |
| StoryModal | 故事弹窗 | components/StoryModal.tsx |
| GameMenu | 开始菜单 | components/GameMenu.tsx |
| WhiteFlash | 白屏效果 | components/WhiteFlash.tsx |

---

## 动画实现方案

| 动画 | 库 | 实现方式 | 复杂度 |
|------|-----|---------|--------|
| 蛇移动 | Framer Motion | animate + transition | 中 |
| 发光效果 | CSS | box-shadow + animation | 低 |
| 受伤闪烁 | Framer Motion | animate opacity | 低 |
| 子弹时间 | CSS | filter + transition | 低 |
| 白屏效果 | Framer Motion | animate opacity | 低 |
| 果实闪烁 | CSS | keyframes pulse | 低 |
| 预警闪烁 | Framer Motion | animate scale + opacity | 中 |
| 文字打字机 | 自定义 Hook | useTypewriter | 中 |
| 得分飘升 | Framer Motion | animate y + opacity | 低 |
| 按钮弹跳 | Framer Motion | whileHover + whileTap | 低 |

---

## 项目文件结构

```
app/
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx      # 游戏画布
│   │   ├── Snake.tsx           # 玩家蛇
│   │   ├── Enemy.tsx           # 敌人蛇
│   │   ├── Boss.tsx            # Boss
│   │   ├── Fruit.tsx           # 果实
│   │   ├── Shield.tsx          # 护盾
│   │   ├── Bow.tsx             # 弓箭
│   │   ├── Arrow.tsx           # 箭矢
│   │   ├── ExplosiveArrow.tsx  # 爆炸箭
│   │   ├── StatusBar.tsx       # 状态栏
│   │   ├── StoryModal.tsx      # 故事弹窗
│   │   ├── GameMenu.tsx        # 游戏菜单
│   │   └── WhiteFlash.tsx      # 白屏效果
│   ├── hooks/
│   │   ├── useGameLoop.ts      # 游戏循环
│   │   ├── useCollision.ts     # 碰撞检测
│   │   ├── useTypewriter.ts    # 打字机效果
│   │   └── useSound.ts         # 音效管理
│   ├── types/
│   │   └── game.ts             # 类型定义
│   ├── utils/
│   │   └── gameHelpers.ts      # 游戏工具函数
│   ├── styles/
│   │   └── pixel.css           # 像素风格样式
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── sounds/                 # 音效文件
├── index.html
├── package.json
└── tailwind.config.js
```

---

## 依赖列表

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "howler": "^2.2.3",
    "@types/howler": "^2.2.7"
  }
}
```

---

## 游戏状态管理

```typescript
interface GameState {
  // 游戏状态
  isPlaying: boolean;
  isPaused: boolean;
  level: 1 | 2 | 3;
  score: number;
  
  // 玩家状态
  player: {
    segments: Position[];
    health: number;
    maxHealth: number;
    hasShield: boolean;
    arrows: number;
  };
  
  // 敌人状态
  enemies: Enemy[];
  boss: Boss | null;
  
  // 道具状态
  fruits: Position[];
  shields: Position[];
  bows: Position[];
  
  // 特效状态
  isBulletTime: boolean;
  whiteFlashDuration: number;
  
  // 鼠标位置
  mousePosition: Position;
}
```

---

## 性能优化

1. **使用 requestAnimationFrame** 进行游戏循环
2. **Canvas 渲染** 用于大量粒子效果
3. **React.memo** 优化组件重渲染
4. **useCallback** 缓存回调函数
5. **will-change** CSS 属性优化动画

---

## 碰撞检测算法

```typescript
// AABB 碰撞检测
const checkCollision = (a: Rectangle, b: Rectangle): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

// 圆形碰撞检测 (用于爆炸箭)
const checkCircleCollision = (
  circle: { x: number; y: number; radius: number },
  rect: Rectangle
): boolean => {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const distance = Math.sqrt(
    Math.pow(circle.x - closestX, 2) + Math.pow(circle.y - closestY, 2)
  );
  return distance < circle.radius;
};
```

---

## 网格系统

- 网格大小: 20x20px
- 画布尺寸: 800x600px (40x30格)
- 移动速度: 10格/秒 = 200px/秒
- 更新频率: 60fps
