import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import WaveBackground from '../WaveBackground/WaveBackground';
import Navbar from '../Navbar/Navbar';
import MusicToggle from '../MusicToggle/MusicToggle';
import AuthModal from '../AuthModal/AuthModal';
import styles from './Layout.module.css';

export default function Layout() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <WaveBackground />
      <Navbar onLoginClick={() => setAuthModalOpen(true)} />

      <main className={styles.main}>
        <Outlet />
      </main>

      <MusicToggle />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
