import React, { useEffect, useRef, useState } from 'react';
import CardGrid from './components/CardGrid';
import ServiceOverlay from './components/ServiceOverlay';
import { gsap } from 'gsap';

export default function App() {
  const [scrollPos, setScrollPos] = useState(0);   // continuous scroll: 0‒8
  const [inStack, setInStack] = useState(false);   // whether cards are fully stacked
  const scrollIndicatorRef = useRef(null);
  const containerRef = useRef(null);

  // Throttle/debounce wheel
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.004; // replicate scrollSensitivity
      setScrollPos((prev) => {
        let next = prev + delta;
        // Clamp between 0 and 8
        if (next < 0) next = 0;
        if (next > 8) next = 8;
        return next;
      });
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch support (mobile)
  useEffect(() => {
    let touchStartY = 0;
    let touchStartTime = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const dy = touchStartY - touchY;
      const dt = Date.now() - touchStartTime;
      if (dt > 50) {
        const delta = dy * 0.002; // similar sensitivity
        setScrollPos((prev) => {
          let next = prev + delta;
          if (next < 0) next = 0;
          if (next > 8) next = 8;
          return next;
        });
        touchStartY = touchY;
        touchStartTime = Date.now();
      }
    };
    const elem = containerRef.current;
    if (elem) {
      elem.addEventListener('touchstart', handleTouchStart, { passive: true });
      elem.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    return () => {
      if (elem) {
        elem.removeEventListener('touchstart', handleTouchStart);
        elem.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  // Whenever scrollPos crosses thresholds, toggle inStack and animate overlay
  useEffect(() => {
    if (scrollPos >= 0.1 && !inStack) {
      // Enter stack
      setInStack(true);
    } else if (scrollPos <= 0.1 && inStack) {
      // Exit stack
      setInStack(false);
    }

    // Update scroll indicator
    if (scrollIndicatorRef.current) {
      const pct = (scrollPos / 8) * 100;
      gsap.to(scrollIndicatorRef.current, { height: `${pct}%`, duration: 0.1 });
    }
  }, [scrollPos, inStack]);

  return (
    <>
      <header>
        <h1>Our Services</h1>
        <p>Discover what we can do for you</p>
      </header>

      <div id="main-container" ref={containerRef}>
        <CardGrid scrollPos={scrollPos} inStack={inStack} />
        <ServiceOverlay scrollPos={scrollPos} active={inStack} />
      </div>

      <div id="scroll-indicator">
        <div id="scroll-progress" ref={scrollIndicatorRef}></div>
      </div>
    </>
  );
}
