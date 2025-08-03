import { LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('form-label', className)}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

export { Label };