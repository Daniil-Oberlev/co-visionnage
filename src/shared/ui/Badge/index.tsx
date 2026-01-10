import type { VariantProps } from 'class-variance-authority';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { badgeVariants } from './variants';

export interface BadgeProperties
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({
  className,
  variant,
  ...properties
}: BadgeProperties) => {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...properties}
    />
  );
};
