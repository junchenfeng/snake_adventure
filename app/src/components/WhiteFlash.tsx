import { motion, AnimatePresence } from 'framer-motion';

interface WhiteFlashProps {
  duration: number;
  onComplete?: () => void;
}

export function WhiteFlash({ onComplete }: WhiteFlashProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.1,
        }}
        onAnimationComplete={onComplete}
      />
    </AnimatePresence>
  );
}
