import { motion } from 'motion/react';

interface ShiftyLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function ShiftyLogo({ size = 64, animated = true, className = '' }: ShiftyLogoProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background with Gradient */}
      <div 
        className="absolute inset-0 rounded-[28%]"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(99, 102, 241, 0.15)',
        }}
      />
      
      {/* Letter S Design */}
      <svg 
        width={size * 0.55} 
        height={size * 0.65} 
        viewBox="0 0 44 52" 
        fill="none"
        className="relative z-10"
      >
        {/* Stylized "S" with shift/rotation concept */}
        <motion.g
          initial={animated ? { rotate: 0 } : {}}
          animate={animated ? { 
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: '22px 26px' }}
        >
          {/* Top curve of S */}
          <path
            d="M 34 12 C 34 6 29 2 22 2 C 15 2 10 6 10 12 C 10 16 12 18 16 20 L 28 25 C 31 26.5 32 28 32 31 C 32 34 29 37 22 37 C 15 37 12 34 12 30"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          
          {/* Bottom curve of S */}
          <path
            d="M 10 40 C 10 46 15 50 22 50 C 29 50 34 46 34 40 C 34 36 32 34 28 32 L 16 27 C 13 25.5 12 24 12 21 C 12 18 15 15 22 15 C 29 15 32 18 32 22"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
        </motion.g>
      </svg>

      {/* Animated glow effect */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-[28%]"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
            filter: 'blur(16px)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}

// Simple static version for small sizes
export function ShiftyLogoSimple({ size = 32 }: { size?: number }) {
  return (
    <div 
      className="inline-flex items-center justify-center rounded-[28%]"
      style={{ 
        width: size, 
        height: size,
        background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
      }}
    >
      <svg 
        width={size * 0.55} 
        height={size * 0.65} 
        viewBox="0 0 44 52" 
        fill="none"
      >
        {/* Top curve */}
        <path
          d="M 34 12 C 34 6 29 2 22 2 C 15 2 10 6 10 12 C 10 16 12 18 16 20 L 28 25 C 31 26.5 32 28 32 31 C 32 34 29 37 22 37 C 15 37 12 34 12 30"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
        
        {/* Bottom curve */}
        <path
          d="M 10 40 C 10 46 15 50 22 50 C 29 50 34 46 34 40 C 34 36 32 34 28 32 L 16 27 C 13 25.5 12 24 12 21 C 12 18 15 15 22 15 C 29 15 32 18 32 22"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}
