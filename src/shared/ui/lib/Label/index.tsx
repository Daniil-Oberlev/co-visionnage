'use client';

import type { VariantProps } from 'class-variance-authority';

import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const labelVariants = cva(
  'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...properties }, reference) => (
  <LabelPrimitive.Root
    ref={reference}
    className={cn(labelVariants(), className)}
    {...properties}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
