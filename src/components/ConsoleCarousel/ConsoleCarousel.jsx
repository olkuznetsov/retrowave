import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CONSOLES } from '../../data/consoles';
import styles from './ConsoleCarousel.module.css';

export default function ConsoleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const current = CONSOLES[currentIndex];
  const prevIndex = (currentIndex - 1 + CONSOLES.length) % CONSOLES.length;
  const nextIndex = (currentIndex + 1) % CONSOLES.length;

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % CONSOLES.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + CONSOLES.length) % CONSOLES.length);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Enter') navigate(`/console/${current.id}`);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, navigate, current.id]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3, ease: 'easeIn' },
    }),
  };

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Title */}
      <h1 className={styles.mainTitle}>
        Choose Your Console
      </h1>
      <p className={styles.subtitle}>
        {CONSOLES.length} classic systems ready to play
      </p>

      {/* Carousel Track */}
      <div className={styles.track}>
        {/* Left Arrow */}
        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={goPrev}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Previous Console (peek) */}
        <div className={`${styles.peekCard} ${styles.peekLeft}`} onClick={goPrev}>
          <div className={styles.peekImageWrap}>
            <div className={styles.consolePlaceholder} style={{ borderColor: CONSOLES[prevIndex].color }}>
              {CONSOLES[prevIndex].shortName}
            </div>
          </div>
        </div>

        {/* Current Console */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={styles.centerCard}
          >
            <div
              className={styles.consoleCard}
              onClick={() => navigate(`/console/${current.id}`)}
            >
              <div className={styles.consoleImageWrap}>
                <div
                  className={styles.consolePlaceholderLarge}
                  style={{
                    borderColor: current.color,
                    boxShadow: `0 0 30px ${current.color}40`,
                  }}
                >
                  <span className={styles.consoleName}>{current.shortName}</span>
                </div>
              </div>

              <div className={styles.consoleInfo}>
                <h2 className={styles.consolTitle}>{current.name}</h2>
                <div className={styles.consoleMeta}>
                  <span className={styles.year}>{current.year}</span>
                  <span className={styles.dot}>&bull;</span>
                  <span className={styles.manufacturer}>{current.manufacturer}</span>
                </div>
                <p className={styles.consoleDesc}>{current.description}</p>
              </div>

              <button
                className={`btn-ffx ${styles.enterBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/console/${current.id}`);
                }}
              >
                Enter
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Console (peek) */}
        <div className={`${styles.peekCard} ${styles.peekRight}`} onClick={goNext}>
          <div className={styles.peekImageWrap}>
            <div className={styles.consolePlaceholder} style={{ borderColor: CONSOLES[nextIndex].color }}>
              {CONSOLES[nextIndex].shortName}
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={goNext}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className={styles.dots}>
        {CONSOLES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
