'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProperties = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...properties }: ToasterProperties) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      className='toaster group'
      theme={theme as ToasterProperties['theme']}
      toastOptions={{
        classNames: {
          toast:
            'group toast !w-full sm:!w-[550px] !flex !items-start !p-6 !rounded-none !border-[4px] !border-black !bg-white !text-black !shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] !opacity-100 !max-w-none',
          content: '!flex-1 !w-full !max-w-none !block',
          title:
            '!text-3xl !font-black !leading-none !w-full !block !m-0 !uppercase !tracking-tighter',
          description:
            '!text-xl !font-bold !text-black !w-full !block !mt-2 !leading-tight',
          icon: '!mt-1 !mr-5 !scale-[1.8] !flex-shrink-0',
          actionButton:
            '!bg-yellow-400 !text-black !border-[3px] !border-black !rounded-none !shadow-none hover:!bg-yellow-500 !font-black !uppercase !px-6 !py-3 !text-lg',
          cancelButton:
            '!bg-red-500 !text-white !border-[3px] !border-black !rounded-none !shadow-none !font-black !uppercase !px-6 !py-3 !text-lg',
          error: '!text-black',
          success: '!bg-lime-500 !text-black',
        },
      }}
      {...properties}
    />
  );
};
