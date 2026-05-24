export interface CheckConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface UniversalChecksConfig {
  enabled: boolean;
  checks: {
    consoleErrors: CheckConfig & { ignorePatterns: RegExp[] };
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
    consoleErrors: { enabled: true, ignorePatterns: [/favicon/i] },
    brokenImages: { enabled: true },
    accessibility: { enabled: true, level: 'serious' },
    metaTags: { enabled: true },
    brokenLinks: { enabled: false, maxLinks: 20 },
    performanceMetrics: { enabled: true, domContentLoaded: 3000, load: 5000 },
    responsiveLayout: { enabled: true },
  },
  skipPatterns: [/\/api\//, /\.json$/],
};
