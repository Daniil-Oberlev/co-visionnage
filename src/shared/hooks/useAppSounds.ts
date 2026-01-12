import useSound from 'use-sound';

const config = { volume: 0.2 };

export const useAppSounds = () => {
  const [playClick] = useSound('/sounds/click.mp3', {
    ...config,
    volume: 0.1,
  });
  const [playSuccess] = useSound('/sounds/success.mp3', {
    ...config,
  });
  const [playDelete] = useSound('/sounds/click.mp3', {
    ...config,
    playbackRate: 0.3,
  });

  return {
    playClick,
    playSuccess,
    playDelete,
  };
};
