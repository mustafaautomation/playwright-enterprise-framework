export interface CheckConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface UniversalChecksConfig {
  enabled: boolean;
  checks: {
    consoleErrors: CheckConfig & {
      /** Console error messages matching any of these are ignored. */
      ignorePatterns: RegExp[];
      /** "Failed to load resource" errors for URLs matching any of these are ignored. */
      ignoreResourceUrlPatterns: RegExp[];
      /** Ignore failed sub-resource loads from origins other than the app under test. */
      ignoreThirdPartyResources: boolean;
      /**
       * Ignore a 4xx on the top-level document itself. Static SPA hosts (SauceDemo included)
       * answer deep links such as /inventory.html with a 404 status and still serve the app,
       * so the browser logs a console error even though the page renders correctly.
       * The page content is still verified by each test's own assertions.
       */
      ignoreSpaFallbackDocument404: boolean;
    };
    brokenImages: CheckConfig;
    accessibility: CheckConfig & { level: 'minor' | 'moderate' | 'serious' | 'critical' };
    metaTags: CheckConfig;
    brokenLinks: CheckConfig & { maxLinks: number };
    performanceMetrics: CheckConfig & { domContentLoaded: number; load: number };
    responsiveLayout: CheckConfig;
  };
  skipPatterns: RegExp[];
}

export const universalChecksConfig: UniversalChecksConfig = {
  enabled: true,
  checks: {
    consoleErrors: {
      enabled: true,
      ignorePatterns: [/favicon/i],
      ignoreResourceUrlPatterns: [],
      ignoreThirdPartyResources: true,
      ignoreSpaFallbackDocument404: true,
    },
    brokenImages: { enabled: true },
    accessibility: { enabled: true, level: 'serious' },
    metaTags: { enabled: true },
    brokenLinks: { enabled: false, maxLinks: 20 },
    performanceMetrics: { enabled: true, domContentLoaded: 3000, load: 5000 },
    responsiveLayout: { enabled: true },
  },
  skipPatterns: [/\/api\//, /\.json$/],
};
