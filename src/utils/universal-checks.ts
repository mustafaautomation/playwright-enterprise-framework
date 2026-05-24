import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { universalChecksConfig } from '../../config/universal-checks.config';

export class UniversalChecks {
  private consoleErrors: string[] = [];

  constructor(private readonly page: Page) {}

  /** Start collecting console errors — call once before navigation. */
  startConsoleCollection(): void {
    this.consoleErrors = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });
  }

  /** Run all enabled checks on the current page. */
  async runAll(): Promise<void> {
    const url = this.page.url();
    const cfg = universalChecksConfig;

    if (cfg.skipPatterns.some((p) => p.test(url))) return;

    if (cfg.checks.consoleErrors.enabled) await this.checkConsoleErrors();
    if (cfg.checks.brokenImages.enabled) await this.checkBrokenImages();
    if (cfg.checks.accessibility.enabled) await this.checkAccessibility();
    if (cfg.checks.metaTags.enabled) await this.checkMetaTags();
    if (cfg.checks.brokenLinks.enabled) await this.checkBrokenLinks();
    if (cfg.checks.performanceMetrics.enabled) await this.checkPerformanceMetrics();
    if (cfg.checks.responsiveLayout.enabled) await this.checkResponsiveLayout();
  }

  private async checkConsoleErrors(): Promise<void> {
    const { ignorePatterns } = universalChecksConfig.checks.consoleErrors;
    const unexpected = this.consoleErrors.filter((err) => !ignorePatterns.some((p) => p.test(err)));
    expect(unexpected, `Unexpected console errors: ${unexpected.join(', ')}`).toHaveLength(0);
  }

  private async checkBrokenImages(): Promise<void> {
    const broken = await this.page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter((img) => img.src && img.naturalWidth === 0).map((img) => img.src);
    });
    expect(broken, `Broken images: ${broken.join(', ')}`).toHaveLength(0);
  }

  private async checkAccessibility(): Promise<void> {
    const { level } = universalChecksConfig.checks.accessibility;
    const impactLevels: string[] = [];
    if (level === 'minor') impactLevels.push('minor', 'moderate', 'serious', 'critical');
    else if (level === 'moderate') impactLevels.push('moderate', 'serious', 'critical');
    else if (level === 'serious') impactLevels.push('serious', 'critical');
    else impactLevels.push('critical');

    const results = await new AxeBuilder({ page: this.page }).analyze();
    const violations = results.violations.filter((v) => impactLevels.includes(v.impact ?? ''));
    expect(
      violations.map((v) => `${v.id}: ${v.description}`),
      'Accessibility violations found',
    ).toHaveLength(0);
  }

  private async checkMetaTags(): Promise<void> {
    const title = await this.page.title();
    expect(title.length, 'Page <title> should be non-empty').toBeGreaterThan(0);

    const hasViewport = await this.page.locator('meta[name="viewport"]').count();
    expect(hasViewport, 'Page should have <meta name="viewport">').toBeGreaterThan(0);

    const lang = await this.page.getAttribute('html', 'lang');
    expect(lang, 'Page <html> should have a lang attribute').toBeTruthy();
  }

  private async checkBrokenLinks(): Promise<void> {
    const { maxLinks } = universalChecksConfig.checks.brokenLinks;
    const links: string[] = await this.page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => href.startsWith('http'));
    });

    const uniqueLinks = [...new Set(links)].slice(0, maxLinks);
    const broken: string[] = [];

    for (const link of uniqueLinks) {
      try {
        const resp = await this.page.request.head(link, { timeout: 5000 });
        if (resp.status() >= 400) broken.push(`${link} (${resp.status()})`);
      } catch {
        broken.push(`${link} (timeout/error)`);
      }
    }
    expect(broken, `Broken links: ${broken.join(', ')}`).toHaveLength(0);
  }

  private async checkPerformanceMetrics(): Promise<void> {
    const { domContentLoaded, load } = universalChecksConfig.checks.performanceMetrics;
    const metrics = await this.page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (!nav) return null;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd,
        load: nav.loadEventEnd,
      };
    });
    if (!metrics) return; // no navigation entry available
    expect(metrics.domContentLoaded, 'DOMContentLoaded too slow').toBeLessThan(domContentLoaded);
    expect(metrics.load, 'Page load too slow').toBeLessThan(load);
  }

  private async checkResponsiveLayout(): Promise<void> {
    const overflows = await this.page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows, 'Page content overflows viewport horizontally').toBe(false);
  }
}
