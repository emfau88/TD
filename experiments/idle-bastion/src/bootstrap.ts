import { loadingScreen } from './loading-screen';

const screen = loadingScreen();
screen?.begin('modules');
// Dynamic import catches missing game chunks before the game's own listeners exist.
void import('./main').catch(() => screen?.fail());
window.addEventListener('unhandledrejection', () => { if (screen?.visible) screen.fail(); });
