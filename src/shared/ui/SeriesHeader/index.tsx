'use client';

import { Github, LogOut, Mail } from 'lucide-react';

import { createClient } from '@/shared/api/supabase/client';
import { useAppSounds } from '@/shared/hooks/useAppSounds';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/lib';

interface HeaderProperties {
  userEmail?: string;
}

export const SeriesHeader = ({ userEmail }: HeaderProperties) => {
  const { playClick } = useAppSounds();
  const supabase = createClient();

  const handleLogin = async (provider: 'google' | 'github') => {
    playClick();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${globalThis.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    playClick();
    await supabase.auth.signOut();
    globalThis.location.reload();
  };

  return (
    <header className='brutal-font mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-start'>
      <div className='-rotate-2 transform border-4 border-black bg-lime-400 p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform hover:rotate-0'>
        <h1 className='text-4xl font-black tracking-tighter text-black uppercase md:text-6xl'>
          НАШИ СЕРИАЛЫ
        </h1>
        <div className='mt-2 inline-block rotate-3 border-2 border-black bg-pink-500 px-4 py-1 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
          ОТСЛЕЖИВАЕМ ВСЁ ВМЕСТЕ! ❤️
        </div>
      </div>

      <div className='z-10'>
        {userEmail ? (
          <div className='flex rotate-1 items-center gap-4 border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
            <div className='flex flex-col'>
              <span className='text-[10px] font-black text-gray-400 uppercase'>
                Пользователь
              </span>
              <p className='font-black text-black lowercase'>{userEmail}</p>
            </div>
            <Button
              className='border-2 border-black bg-red-500 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
              onClick={handleLogout}
            >
              <LogOut color='white' size={20} />
            </Button>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className='rotate-2 border-4 border-black bg-yellow-400 px-8 py-6 text-2xl font-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:rotate-0 hover:shadow-none active:bg-lime-400'
                onClick={() => playClick()}
              >
                ВХОД
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-sm rounded-none border-[6px] border-black bg-pink-400 p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] [&>button]:rounded-none [&>button]:border-4 [&>button]:border-black [&>button]:bg-white'>
              <DialogHeader>
                <div className='mb-6 -rotate-2 border-4 border-black bg-purple-600 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'>
                  <DialogTitle className='text-center text-3xl font-black tracking-tight text-yellow-300 uppercase'>
                    КТО ТЫ?!
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className='grid gap-6'>
                <Button
                  className='flex h-16 gap-4 border-4 border-black bg-white text-xl font-black text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                  onClick={() => handleLogin('google')}
                >
                  <Mail size={28} /> GOOGLE
                </Button>
                <Button
                  className='flex h-16 gap-4 border-4 border-black bg-gray-900 text-xl font-black text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                  onClick={() => handleLogin('github')}
                >
                  <Github size={28} /> GITHUB
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
};
