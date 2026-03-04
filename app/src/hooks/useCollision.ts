import { useCallback } from 'react';
import type { Position, Rectangle } from '@/types/game';
import { GAME_CONFIG } from '@/types/game';

export function useCollision() {
  // AABB 碰撞检测
  const checkRectCollision = useCallback((a: Rectangle, b: Rectangle): boolean => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }, []);

  // 点与矩形碰撞
  const checkPointRectCollision = useCallback((point: Position, rect: Rectangle): boolean => {
    return (
      point.x >= rect.x &&
      point.x < rect.x + rect.width &&
      point.y >= rect.y &&
      point.y < rect.y + rect.height
    );
  }, []);

  // 圆形碰撞检测
  const checkCircleRectCollision = useCallback((
    circle: { x: number; y: number; radius: number },
    rect: Rectangle
  ): boolean => {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distance = Math.sqrt(
      Math.pow(circle.x - closestX, 2) + Math.pow(circle.y - closestY, 2)
    );
    return distance < circle.radius;
  }, []);

  // 获取网格位置
  const getGridPosition = useCallback((pixelPosition: Position): Position => {
    return {
      x: Math.floor(pixelPosition.x / GAME_CONFIG.GRID_SIZE),
      y: Math.floor(pixelPosition.y / GAME_CONFIG.GRID_SIZE),
    };
  }, []);

  // 获取像素位置（网格中心）
  const getPixelPosition = useCallback((gridPosition: Position): Position => {
    return {
      x: gridPosition.x * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
      y: gridPosition.y * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
    };
  }, []);

  // 计算两点距离
  const getDistance = useCallback((a: Position, b: Position): number => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }, []);

  // 计算方向向量
  const getDirection = useCallback((from: Position, to: Position): Position => {
    const distance = getDistance(from, to);
    if (distance === 0) return { x: 0, y: 0 };
    return {
      x: (to.x - from.x) / distance,
      y: (to.y - from.y) / distance,
    };
  }, [getDistance]);

  return {
    checkRectCollision,
    checkPointRectCollision,
    checkCircleRectCollision,
    getGridPosition,
    getPixelPosition,
    getDistance,
    getDirection,
  };
}
