import { motion } from 'framer-motion';

interface ParticleEffectProps {
  x: number;
  y: number;
  color: string;
  type?: 'collect' | 'hit' | 'spawn';
}

export function ParticleEffect({ x, y, color, type = 'collect' }: ParticleEffectProps) {
  const particleCount = type === 'hit' ? 6 : 8;
  
  return (
    <>
      {[...Array(particleCount)].map((_, i) => {
        const angle = (360 / particleCount) * i;
        const distance = type === 'hit' ? 25 : 15;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;
        
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: x,
              top: y,
              width: type === 'hit' ? 5 : 4,
              height: type === 'hit' ? 5 : 4,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{ 
              x: tx, 
              y: ty, 
              opacity: 0, 
              scale: 0 
            }}
            transition={{ 
              duration: type === 'hit' ? 0.4 : 0.5, 
              ease: 'easeOut' 
            }}
          />
        );
      })}
    </>
  );
}
