import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...properties }, reference) => {
  return (
    <textarea
      ref={reference}
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-15 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...properties}
    />
  );
});
Textarea.displayName = 'Textarea';
