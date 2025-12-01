import React, { Suspense } from 'react';
import { useGameStore } from './store/useGameStore';
import UIOverlay from './components/ui/UIOverlay';
import MobileWarning from './components/ui/MobileWarning';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
const MainMenu = React.lazy(() => import('./components/menu/MainMenu'));
const GameCanvas = React.lazy(() => import('./components/game/GameCanvas'));

const LoadingScreen = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
    <p className="text-lg font-medium text-slate-400">Loading Game Assets...</p>
  </div>
);

function App() {
  const { gameStatus } = useGameStore();

  return (
    <ErrorBoundary>
      <div className="w-full h-screen relative overflow-hidden bg-slate-900">
        <Suspense fallback={<LoadingScreen />}>
          {gameStatus === 'MENU' ? (
            <MainMenu />
          ) : (
            <>
              <GameCanvas />
              <UIOverlay />
              <MobileWarning />
            </>
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
