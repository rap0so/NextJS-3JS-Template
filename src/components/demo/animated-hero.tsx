'use client';

import { types } from '@theatre/core';
import { useEffect, useRef } from 'react';

import { gsap, useGSAP } from '@/lib/gsap';
import { getDemoSheet } from '@/lib/theatre/project';

import styles from './animated-hero.module.css';

const HEADLINE = 'Volvo Next.js';

/**
 * Split into per-word spans so GSAP can stagger them. Animating siblings moves
 * the whitespace text nodes between them, which would collapse the heading's
 * accessible name to "VolvoNext.js" -- so the words are hidden from the
 * accessibility tree and the real text is exposed once via `aria-label`,
 * with the visual gap coming from CSS rather than from text nodes.
 */
const HEADLINE_WORDS = [
  { text: 'Volvo', accent: false },
  { text: 'Next.js', accent: true },
];

const BOX_PROPS = {
  x: types.number(0, { range: [-160, 160], nudgeMultiplier: 1 }),
  y: types.number(0, { range: [-60, 60], nudgeMultiplier: 1 }),
  rotate: types.number(0, { range: [-180, 180], nudgeMultiplier: 1 }),
  scale: types.number(1, { range: [0.2, 2.5], nudgeMultiplier: 0.01 }),
  opacity: types.number(1, { range: [0, 1], nudgeMultiplier: 0.01 }),
};

export default function AnimatedHero() {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // GSAP owns the entrance animation. `scope` limits selectors to this subtree
  // and `useGSAP` reverts every tween it created when the component unmounts.
  useGSAP(
    () => {
      gsap.from('[data-animate="headline"] > span', {
        yPercent: 120,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
      });

      gsap.from('[data-animate="subtitle"]', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        delay: 0.35,
        ease: 'power2.out',
      });
    },
    { scope: rootRef },
  );

  // Theatre.js owns the box: it is the authoring surface. The studio writes to
  // the sheet object, `onValuesChange` pushes those values into the DOM through
  // GSAP, and in production the same values replay from `state.json`.
  useEffect(() => {
    const sheet = getDemoSheet();

    // `reconfigure` makes this idempotent under StrictMode's double-invoke and HMR.
    const box = sheet.object('Box', BOX_PROPS, { reconfigure: true });

    const unsubscribe = box.onValuesChange((values) => {
      if (!boxRef.current) return;

      gsap.set(boxRef.current, {
        x: values.x,
        y: values.y,
        rotate: values.rotate,
        scale: values.scale,
        opacity: values.opacity,
      });
    });

    let cancelled = false;

    void sheet.project.ready.then(() => {
      if (cancelled || process.env.NODE_ENV !== 'production') return;
      // Only autoplay outside the editor -- in dev the studio drives the playhead.
      void sheet.sequence.play({ iterationCount: Infinity });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <section className={styles.hero} ref={rootRef}>
      <h1 aria-label={HEADLINE} className={styles.headline} data-animate="headline">
        {HEADLINE_WORDS.map(({ text, accent }) => (
          <span
            aria-hidden="true"
            className={accent ? `${styles.word} ${styles.accent}` : styles.word}
            key={text}
          >
            {text}
          </span>
        ))}
      </h1>

      <p className={styles.subtitle} data-animate="subtitle">
        Next.js App Router, TypeScript, Airbnb ESLint, native CSS nesting, GSAP and Theatre.js.
        Contentful plugs into <code>src/lib/contentful</code>.
      </p>

      <div className={styles.stage}>
        <div className={styles.box} ref={boxRef} />
      </div>

      <p className={styles.hint}>
        Run <code>yarn dev</code> and use the Theatre.js studio to animate the square, then export
        the sheet over <code>src/lib/theatre/state.json</code>.
      </p>
    </section>
  );
}
