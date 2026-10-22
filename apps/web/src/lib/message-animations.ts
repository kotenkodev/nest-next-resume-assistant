import type { Variants } from 'motion/react';

export const MESSAGE_ANIMATIONS = {
  'slide-up': {
    variants: {
      initial: { opacity: 0, y: 10 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
      },
      exit: { opacity: 0, y: 4, transition: { duration: 0.15 } },
    } satisfies Variants,
  },
};
