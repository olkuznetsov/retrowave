import styles from './WaveBackground.module.css';

export default function WaveBackground() {
  return (
    <div className={styles.waveContainer}>
      {/* Gradient overlay */}
      <div className={styles.gradientOverlay} />

      {/* Bottom wave — slow, dark */}
      <div className={`${styles.waveLayer} ${styles.wave1}`}>
        <svg viewBox="0 0 2400 320" preserveAspectRatio="none" className={styles.waveSvg}>
          <path
            d="M0,192 C200,96 400,288 600,192 C800,96 1000,288 1200,192 C1400,96 1600,288 1800,192 C2000,96 2200,288 2400,192 L2400,320 L0,320 Z
               M2400,192 C2600,96 2800,288 3000,192 C3200,96 3400,288 3600,192 C3800,96 4000,288 4200,192 C4400,96 4600,288 4800,192 L4800,320 L2400,320 Z"
            fill="rgba(13, 40, 71, 0.8)"
          />
        </svg>
      </div>

      {/* Middle wave — medium, teal */}
      <div className={`${styles.waveLayer} ${styles.wave2}`}>
        <svg viewBox="0 0 2400 320" preserveAspectRatio="none" className={styles.waveSvg}>
          <path
            d="M0,224 C150,128 350,288 600,224 C850,160 1050,288 1200,224 C1350,160 1550,288 1800,224 C2050,160 2250,288 2400,224 L2400,320 L0,320 Z
               M2400,224 C2550,128 2750,288 3000,224 C3250,160 3450,288 3600,224 C3750,160 3950,288 4200,224 C4450,160 4650,288 4800,224 L4800,320 L2400,320 Z"
            fill="rgba(26, 74, 122, 0.6)"
          />
        </svg>
      </div>

      {/* Top wave — fast, light */}
      <div className={`${styles.waveLayer} ${styles.wave3}`}>
        <svg viewBox="0 0 2400 320" preserveAspectRatio="none" className={styles.waveSvg}>
          <path
            d="M0,256 C100,192 300,288 500,256 C700,224 900,288 1100,256 C1300,224 1500,288 1700,256 C1900,224 2100,288 2400,256 L2400,320 L0,320 Z
               M2400,256 C2500,192 2700,288 2900,256 C3100,224 3300,288 3500,256 C3700,224 3900,288 4100,256 C4300,224 4500,288 4800,256 L4800,320 L2400,320 Z"
            fill="rgba(84, 153, 181, 0.35)"
          />
        </svg>
      </div>

      {/* Floating particles */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              opacity: 0.1 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
