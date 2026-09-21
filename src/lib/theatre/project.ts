import { getProject, type IProject, type ISheet } from '@theatre/core';

import projectState from './state.json';

/**
 * Also the key Theatre uses to persist studio edits in browser storage, so
 * renaming it discards any state saved under the old name.
 */
export const THEATRE_PROJECT_NAME = 'App';
export const DEMO_SHEET_NAME = 'Demo Scene';

/**
 * In production the project is hydrated from the checked-in `state.json`, so the
 * animation plays exactly as it was authored. In development the state is left
 * out, which lets the studio own it and persist your edits to browser storage --
 * you then export the sheet from the studio and overwrite `state.json`.
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

let project: IProject | undefined;

export function getTheatreProject(): IProject {
  project ??= getProject(THEATRE_PROJECT_NAME, isDevelopment ? undefined : { state: projectState });

  return project;
}

export function getDemoSheet(): ISheet {
  return getTheatreProject().sheet(DEMO_SHEET_NAME);
}
