import { isDevMode } from '@angular/core';

export function isDev(): boolean {
  return isDevMode();
}
