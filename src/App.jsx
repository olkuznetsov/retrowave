import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ConsolePage from './pages/ConsolePage';
import PlayPage from './pages/PlayPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MusicProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/console/:consoleId" element={<ConsolePage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              {/* PlayPage renders fullscreen without Layout */}
              <Route path="/play/:consoleId/:gameId" element={<PlayPage />} />
            </Routes>
          </AnimatePresence>
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
