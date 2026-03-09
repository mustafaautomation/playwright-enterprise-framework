import { Page } from '@playwright/test';

export interface WebVitals {
  fcp: number | null;
  ttfb: number;
  domContentLoaded: number;
  loadComplete: number;
}

export async function collectWebVitals(page: Page): Promise<WebVitals> {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint');

    return {
      fcp: fcp ? fcp.startTime : null,
      ttfb: nav.responseStart - nav.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      loadComplete: nav.loadEventEnd - nav.startTime,
    };
  });
}
