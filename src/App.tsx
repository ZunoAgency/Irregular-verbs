import { useCallback, useEffect, useState } from 'react';
import { Home } from './screens/Home';
import { Session } from './screens/Session';
import { Settings } from './screens/Settings';
import { Welcome } from './screens/Welcome';
import type { SessionMode } from './engine/session';
import { emptyProgress, loadProgress, needsProfile, saveProgress, type Progress } from './storage/progress';

type Screen = 'home' | 'session' | 'settings';

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [saveFailed, setSaveFailed] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [sessionId, setSessionId] = useState(0);
  const [sessionMode, setSessionMode] = useState<SessionMode>('daily');

  useEffect(() => {
    setSaveFailed(!saveProgress(progress));
  }, [progress]);

  // El botón "atrás" del móvil vuelve al inicio en lugar de cerrar la app.
  useEffect(() => {
    if (window.history.state?.screen) window.history.replaceState(null, '');
    const onPop = () => setScreen('home');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const open = useCallback((next: Screen) => {
    if (next === 'home') {
      if (window.history.state?.screen) window.history.back();
      else setScreen('home');
    } else {
      window.history.pushState({ screen: next }, '');
      if (next === 'session') setSessionId((id) => id + 1);
      setScreen(next);
    }
    window.scrollTo(0, 0);
  }, []);

  const update = useCallback((change: (p: Progress) => Progress) => setProgress(change), []);

  let content;
  if (!progress.settings.onboarded || needsProfile(progress.settings)) {
    content = (
      <Welcome
        settings={progress.settings}
        profileOnly={progress.settings.onboarded}
        onDone={(changes) => {
          setProgress((p) => ({ ...p, settings: { ...p.settings, ...changes } }));
          window.scrollTo(0, 0);
        }}
      />
    );
  } else if (screen === 'session') {
    content = (
      <Session
        key={sessionId}
        mode={sessionMode}
        progress={progress}
        update={update}
        onExit={() => open('home')}
        onMore={() => {
          // Otra sesión seguida, sin pasar por el inicio.
          setSessionMode('more');
          setSessionId((id) => id + 1);
          window.scrollTo(0, 0);
        }}
      />
    );
  } else if (screen === 'settings') {
    content = (
      <Settings
        settings={progress.settings}
        onChange={(settings) => setProgress((p) => ({ ...p, settings }))}
        onReset={() => {
          setProgress((p) => ({ ...emptyProgress(), settings: { ...p.settings } }));
          open('home');
        }}
        onBack={() => open('home')}
      />
    );
  } else {
    content = (
      <Home
        progress={progress}
        onStart={(mode) => {
          setSessionMode(mode);
          open('session');
        }}
        onSettings={() => open('settings')}
      />
    );
  }

  return (
    <div className="app">
      {saveFailed && (
        <p className="banner" role="alert">
          Este navegador no deja guardar el progreso (¿modo privado?). Puedes practicar, pero se perderá al cerrar.
        </p>
      )}
      {content}
    </div>
  );
}
