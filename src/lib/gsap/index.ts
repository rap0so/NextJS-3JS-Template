import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single place where GSAP plugins are registered, so components never have to.
 * Registering `useGSAP` lets GSAP's context clean up tweens on unmount.
 * Both plugins are SSR-safe: they no-op until `window` exists.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };
