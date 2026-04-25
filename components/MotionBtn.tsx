'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const spring = { type: 'spring' as const, stiffness: 500, damping: 18 };

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function MotionBtn({ children, className = '', variant = 'primary', ...props }: BtnProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
      className={`${base} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

type LinkBtnProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
};

export function MotionLinkBtn({ href, children, className = '', variant = 'primary' }: LinkBtnProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const MotionLink = motion(Link);
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
      className={`${base} ${className}`}
    >
      {children}
    </MotionLink>
  );
}
