import { GAME_CONFIG } from '@/types/game';

interface ArrowProps {
  startGridX: number;
  startGridY: number;
  targetGridX: number;
  targetGridY: number;
  progress: number;
}

export function Arrow({ startGridX, startGridY, targetGridX, targetGridY, progress }: ArrowProps) {
  const currentGridX = startGridX + (targetGridX - startGridX) * progress;
  const currentGridY = startGridY + (targetGridY - startGridY) * progress;
  const pixelX = currentGridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
  const pixelY = currentGridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
  const angle = Math.atan2(targetGridY - startGridY, targetGridX - startGridX) * (180 / Math.PI);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: pixelX,
        top: pixelY,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      }}
    >
      <svg
        width="24"
        height="8"
        viewBox="0 0 24 8"
        fill="none"
      >
        {/* 箭杆 */}
        <rect x="0" y="3" width="20" height="2" fill="#d97706" />
        {/* 箭头 */}
        <polygon points="20,0 24,4 20,8" fill="#92400e" />
        {/* 尾羽 */}
        <polygon points="0,0 4,4 0,8" fill="#fcd34d" />
      </svg>
    </div>
  );
}
