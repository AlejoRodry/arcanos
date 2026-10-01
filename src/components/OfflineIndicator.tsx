import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#050B14]/90 border border-[#D4AF37]/50 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl text-xs text-amber-200 font-sans pointer-events-none select-none"
        >
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <WifiOff size={14} className="text-[#D4AF37]" />
          <span>Modo Sin Conexión — La aplicación funciona 100% offline.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
