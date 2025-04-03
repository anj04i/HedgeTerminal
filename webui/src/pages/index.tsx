import { darkTheme } from '@/components/v2/theme';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Landing() {
  const [isHedgeHovered, setIsHedgeHovered] = useState(false);
  const [isLaunchHovered, setIsLaunchHovered] = useState(false);
  const [isLearnHovered, setIsLearnHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Clean up listener
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <>
      <main
        className="min-h-screen relative overflow-hidden select-none"
        style={{ backgroundColor: darkTheme.background, color: darkTheme.text }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="bgGradient" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#0a150a" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={darkTheme.accent}
                  stopOpacity="0"
                />
                <stop
                  offset="50%"
                  stopColor={darkTheme.accent}
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor={darkTheme.accent}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgGradient)" />
            {/* Reduce grid lines on mobile for better performance */}
            {Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${(i + 1) * (isMobile ? 6.66 : 3.33)}%`}
                x2="100%"
                y2={`${(i + 1) * (isMobile ? 6.66 : 3.33)}%`}
                stroke="#111"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${(i + 1) * (isMobile ? 6.66 : 3.33)}%`}
                y1="0"
                x2={`${(i + 1) * (isMobile ? 6.66 : 3.33)}%`}
                y2="100%"
                stroke="#111"
                strokeWidth="1"
              />
            ))}
            <path
              d="M0,400 C300,250 600,550 900,400 S1200,250 1500,400"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-6">
          <div className="max-w-6xl w-full mx-auto flex flex-col items-center text-center">
            <div
              className="text-base font-semibold tracking-tight mb-4 flex items-center gap-1"
              style={{ color: darkTheme.text }}
            >
              <span className="text-base" style={{ color: darkTheme.accent }}>
                &gt;_
              </span>
              <span
                className="cursor-pointer transition-colors duration-300"
                style={{
                  color: isHedgeHovered
                    ? darkTheme.accentHover
                    : darkTheme.accent,
                }}
                onMouseEnter={() => setIsHedgeHovered(true)}
                onMouseLeave={() => setIsHedgeHovered(false)}
              >
                HedgeTerminal
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight md:leading-snug tracking-tight"
              style={{ color: darkTheme.text }}
            >
              Institutional-grade intelligence
              <br className="hidden sm:block" />{' '}
              <span className="sm:hidden">without the</span>
              <span className="hidden sm:inline">
                {' '}
                without the institutional
              </span>{' '}
              noise.
            </h1>
            <p
              className="mt-6 text-base md:text-lg max-w-2xl"
              style={{ color: darkTheme.secondaryText }}
            >
              A fund analytics terminal designed for quants, researchers, and
              capital allocators. Streamlined. Precise. Blazing fast.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 w-full sm:w-auto">
              <Link href="/dashboard" legacyBehavior>
                <a
                  className="w-full sm:w-auto px-6 py-3 font-medium rounded text-black transition-all duration-300"
                  style={{
                    backgroundColor: isLaunchHovered
                      ? darkTheme.accentHover
                      : darkTheme.accent,
                    boxShadow: isLaunchHovered
                      ? '0 10px 15px -3px rgba(52, 211, 153, 0.3)'
                      : 'none',
                  }}
                  onMouseEnter={() => setIsLaunchHovered(true)}
                  onMouseLeave={() => setIsLaunchHovered(false)}
                >
                  Launch Terminal
                </a>
              </Link>
              <Link href="/learn" legacyBehavior>
                <a
                  className="w-full sm:w-auto px-6 py-3 border rounded transition-all duration-300"
                  style={{
                    borderColor: isLearnHovered
                      ? darkTheme.accentHover
                      : darkTheme.border,
                    color: isLearnHovered
                      ? darkTheme.accentHover
                      : darkTheme.secondaryText,
                  }}
                  onMouseEnter={() => setIsLearnHovered(true)}
                  onMouseLeave={() => setIsLearnHovered(false)}
                >
                  Learn More
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
