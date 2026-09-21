'use client';

import { useEffect } from 'react';

import { initTheatreStudio } from '@/lib/theatre/studio';

/**
 * Mounts the Theatre.js editor in development. Renders nothing; the studio
 * injects its own UI into the document. In a production build `initTheatreStudio`
 * returns immediately and the editor chunk is never emitted.
 */
export default function TheatreStudioProvider() {
  useEffect(() => {
    void initTheatreStudio();
  }, []);

  return null;
}
