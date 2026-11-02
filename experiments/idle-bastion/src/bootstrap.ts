import { loadingScreen } from './loading-screen';
import { mountLoadingScene } from './loading-scene';

const screen = loadingScreen();
screen?.begin('modules');
// Dynamic import catches missing game chunks before the game's own listeners exist.
void import('./main').catch(() => screen?.fail());
// Presentation is optional, including on browsers without canvas/animation support.
try {
  const dispose = mountLoadingScene();
  import.meta.hot?.dispose(dispose);
} catch { /* The static inline artwork and real startup remain usable. */ }
window.addEventListener('unhandledrejection', () => { if (screen?.visible) screen.fail(); });
