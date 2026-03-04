import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useEffect } from 'react';

interface StoryModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  showSkip?: boolean;
}

export function StoryModal({ isOpen, content, onClose, showSkip = true }: StoryModalProps) {
  const { displayText, isComplete, start, skip, reset } = useTypewriter(content, 30, 300);

  useEffect(() => {
    if (isOpen) {
      reset();
      start();
    }
  }, [isOpen, content]);

  // 处理跳过
  const handleSkip = () => {
    skip();
  };

  // 处理关闭/继续
  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            className="relative max-w-lg w-full mx-4 p-6 rounded-2xl"
            style={{
              background: 'rgba(22, 33, 62, 0.95)',
              border: '3px solid #e94560',
              boxShadow: '0 0 30px rgba(233, 69, 96, 0.3)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 关闭按钮 */}
            <motion.button
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
              style={{ background: 'rgba(233, 69, 96, 0.2)' }}
              onClick={handleClose}
              whileHover={{ rotate: 90, background: 'rgba(233, 69, 96, 0.4)' }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-[#e94560]'" />
            </motion.button>

            {/* 故事内容 */}
            <div className="mb-6 max-h-80 overflow-y-auto pr-2">
              <pre
                className="whitespace-pre-wrap text-lg leading-relaxed"
                style={{
                  fontFamily: '"Noto Sans SC", sans-serif',
                  color: '#f9fafb',
                }}
              >
                {displayText}
                {!isComplete && (
                  <motion.span
                    className="inline-block w-2 h-5 ml-1 bg-[#e94560]"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </pre>
            </div>

            {/* 按钮 */}
            <div className="flex justify-end gap-3">
              {showSkip && !isComplete && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="text-sm cursor-pointer"
                  style={{
                    border: '2px solid #6b7280',
                    color: '#6b7280',
                  }}
                >
                  跳过
                </Button>
              )}
              <Button
                onClick={handleClose}
                className="text-sm cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #e94560 0%, #8b1538 100%)',
                }}
              >
                {isComplete ? '继续' : '跳过'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
