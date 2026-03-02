import { useEffect } from 'react';

// local props
interface Props {
  onScroll: () => void;
}

const ScrollTrigger: React.FC<Props> = ({ onScroll }) => {
  useEffect(() => {
    window.addEventListener('wheel', onScroll);
    window.addEventListener('touchmove', onScroll);

    return () => {
      window.addEventListener('wheel', onScroll);
      window.addEventListener('touchmove', onScroll);
    };
  }, []);

  return null;
};

export default ScrollTrigger;
