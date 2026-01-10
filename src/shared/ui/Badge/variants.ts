import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent shadow',
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground border-transparent shadow',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
