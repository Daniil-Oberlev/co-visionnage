import { Github, Mail } from 'lucide-react';
import useSound from 'use-sound'; // 1. Импортируем хук

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/lib';

interface HeaderProperties {
  user?: { name: string };
  onLogin: (provider: string) => void;
  onLogout: () => void;
}

export const SeriesHeader = ({ user, onLogin, onLogout }: HeaderProperties) => {
  // 2. Инициализируем звук клика
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });

  return (
    <header className='mb-8 flex flex-col items-center justify-between gap-6 md:flex-row md:items-start'>
      <div className='-rotate-1 transform border-4 border-black bg-lime-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
        <h1 className='text-4xl font-black text-black uppercase md:text-6xl'>
          НАШИ СЕРИАЛЫ
        </h1>
        <div className='mt-2 inline-block rotate-2 border-2 border-black bg-pink-500 px-4 py-1 font-bold'>
          ОТСЛЕЖИВАЕМ ВСЁ ВМЕСТЕ! ❤️
        </div>
      </div>

      <div>
        {user ? (
          <div className='rotate-1 border-4 border-black bg-lime-400 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <p className='mb-2 font-bold text-black'>👤 {user.name}</p>
            <Button
              className='w-full border-2 border-black bg-red-500 font-black text-white'
              onClick={() => {
                playClick(); // Звук при выходе
                onLogout();
              }}
            >
              ВЫХОД
            </Button>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className='rotate-1 border-4 border-black bg-yellow-400 px-6 py-3 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-0'
                onClick={() => playClick()} // Звук при нажатии на "Вход"
              >
                ВХОД
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-sm border-4 border-black bg-pink-400 [&>button]:-top-3 [&>button]:-right-3 [&>button]:rounded-none [&>button]:border-2 [&>button]:border-black [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-red-500'>
              <DialogHeader>
                <div className='mb-4 -rotate-1 border-2 border-black bg-purple-600 p-2 text-yellow-300'>
                  <DialogTitle className='font-black'>
                    ВХОД В СИСТЕМУ
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <Button
                  className='border-2 border-black bg-white font-black text-black'
                  onClick={() => {
                    playClick(); // Звук при выборе Google
                    onLogin('google');
                  }}
                >
                  <Mail /> GOOGLE
                </Button>
                <Button
                  className='flex gap-2 border-2 border-black bg-gray-800 font-black text-white'
                  onClick={() => {
                    playClick(); // Звук при выборе Github
                    onLogin('github');
                  }}
                >
                  <Github /> GITHUB
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
};
