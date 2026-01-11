import { Label } from '../Label';

export const FilterBox = ({
  label,
  children,
  className,
  rotate = 'rotate-1',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  rotate?: 'rotate-1' | '-rotate-1';
}) => (
  <div
    className={`${rotate} border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}
  >
    <Label className='mb-2 block text-sm font-bold text-black uppercase'>
      {label}
    </Label>
    {children}
  </div>
);
