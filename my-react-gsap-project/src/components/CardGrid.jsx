// src/components/CardGrid.jsx
import React, { useEffect, useRef } from 'react';
import { gsap, Power3 } from 'gsap';
import useWindowSize from '../hooks/useWindowSize';

// Import your eight SVG URLs:
import card1 from '../images/card1.svg';
import card2 from '../images/card2.svg';
import card3 from '../images/card3.svg';
import card4 from '../images/card4.svg';
import card5 from '../images/card5.svg';
import card6 from '../images/card6.svg';
import card7 from '../images/card7.svg';
import card8 from '../images/card8.svg';

const cardImages = [
  card1,
  card2,
  card3,
  card4,
  card5,
  card6,
  card7,
  card8,
];

export default function CardGrid({ scrollPos, inStack }) {
  const cardRefs = useRef([]);
  const { width, height } = useWindowSize();

  // Header is 120px tall, so content "canvas" is:
  const headerOffset = 120;
  const canvasH = height - headerOffset;

  // Compute grid coordinates for all 8 cards, centered under the header.
  const computeGridCoords = () => {
    const coords = [];
    const isMobile = width < 768;

    // Base sizes: 40% larger than original P5 bases.
    const baseSize = isMobile ? 224 : 280; // (160*1.4, 200*1.4)
    const baseScale = Math.max(0.5, Math.min(1.2, width / 1200));
    const cardSize = baseScale * baseSize;

    // Increase gap by 30%: original small gaps were 15 (mobile) / 20 (desktop).
    const rawGap = isMobile ? 15 : 20;
    const gap = baseScale * rawGap * 1.3;

    // Total width/height of the grid block.
    if (isMobile) {
      // 2 columns × 4 rows
      const totalWidth = 2 * cardSize + gap;
      const totalHeight = 4 * cardSize + 3 * gap;

      // Center horizontally and vertically under header.
      const startX = (width - totalWidth) / 2;
      const startY = headerOffset + (canvasH - totalHeight) / 2;

      for (let i = 0; i < 8; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        // Calculate center points of each card
        const x = startX + col * (cardSize + gap) + cardSize / 2;
        const y = startY + row * (cardSize + gap) + cardSize / 2;
        coords.push({ x, y, size: cardSize });
      }
    } else {
      // 4 columns × 2 rows
      const totalWidth = 4 * cardSize + 3 * gap;
      const totalHeight = 2 * cardSize + gap;

      const startX = (width - totalWidth) / 2;
      const startY = headerOffset + (canvasH - totalHeight) / 2;

      for (let i = 0; i < 8; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        // Calculate center points of each card
        const x = startX + col * (cardSize + gap) + cardSize / 2;
        const y = startY + row * (cardSize + gap) + cardSize / 2;
        coords.push({ x, y, size: cardSize });
      }
    }

    // Where all eight collapse when inStack = true:
    //   Desktop: x = width/4 (25% from left)
    //   Mobile:  x = width/2 (50% from left)
    const centerX = isMobile ? width * 0.5 : width * 0.25;
    const centerY = headerOffset + canvasH / 2;

    return { coords, centerX, centerY };
  };

  // On mount & resize: position every card in its grid slot (rotation=0, opacity=1).
  useEffect(() => {
    const { coords } = computeGridCoords();
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      gsap.set(el, {
        x: coords[idx].x - coords[idx].size / 2,
        y: coords[idx].y - coords[idx].size / 2,
        width: coords[idx].size,
        height: coords[idx].size,
        rotation: 0,
        opacity: 1,
        transformOrigin: 'center center',
      });
    });
  }, [width, height]);

  // Animate cards into/out of the stack
  useEffect(() => {
    const { coords, centerX, centerY } = computeGridCoords();
    const tl = gsap.timeline();

    if (inStack) {
      // Collapse all cards onto (centerX, centerY) at 40% larger than grid size
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const delay = idx * 0.08; // Slightly slower stagger
        tl.to(
          el,
          {
            x: centerX - (coords[idx].size * 1.4) / 2,
            y: centerY - (coords[idx].size * 1.4) / 2,
            width: coords[idx].size * 1.4,
            height: coords[idx].size * 1.4,
            rotation: 0, // no tilt
            duration: 1.5, // Slower animation
            ease: Power3.easeInOut,
            delay,
          },
          0
        );
      });
    } else {
      // Return all cards to their grid coords (rotation=0). Stagger reverse order.
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const revDelay = (7 - idx) * 0.06; // Slightly slower reverse stagger
        tl.to(
          el,
          {
            x: coords[idx].x - coords[idx].size / 2,
            y: coords[idx].y - coords[idx].size / 2,
            width: coords[idx].size,
            height: coords[idx].size,
            rotation: 0,
            duration: 1.5, // Slower animation
            ease: Power3.easeInOut,
            delay: revDelay,
          },
          0
        );
      });
    }

    return () => tl.kill();
  }, [inStack, width, height]);

  // While stacked, show only the "active" card; hide all others
  useEffect(() => {
    if (!inStack) {
      // Back to grid: clear any running animations and make all cards visible immediately
      cardRefs.current.forEach((el) => {
        if (!el) return;
        // Kill any running opacity/zIndex animations first
        gsap.killTweensOf(el, "opacity,zIndex");
        // Then immediately set all cards visible
        gsap.set(el, { opacity: 1, zIndex: 1 });
      });
      return;
    }

    // When entering stack mode, delay the opacity changes so the collapse animation can be seen
    const delayBeforeHiding = 1.2; // Increased delay to match slower animation

    // scrollPos ∈ [1..8] → raw ∈ [0..7]; clamp to 0..7
    let raw = scrollPos - 1;
    raw = Math.max(0, Math.min(7, raw));
    const activeIdx = Math.floor(raw);

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (idx === activeIdx) {
        gsap.to(el, { opacity: 1, zIndex: 100, duration: 0.3, delay: delayBeforeHiding });
      } else {
        gsap.to(el, { opacity: 0, zIndex: 0, duration: 0.3, delay: delayBeforeHiding });
      }
    });
  }, [scrollPos, inStack]);

  return (
    <div className="card-container">
      {cardImages.map((src, i) => (
        <div
          key={i}
          className="card"
          ref={(el) => (cardRefs.current[i] = el)}
          style={{
            backgroundImage: `url(${src})`,
          }}
        />
      ))}
    </div>
  );
}