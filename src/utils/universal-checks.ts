import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { universalChecksConfig } from '../../config/universal-checks.config';

export class UniversalChecks {
  private consoleErrors: { text: string; url: string }[] = [];
  private failedDocumentUrls = new Set<string>();

  constructor(private readonly page: Page) {}

  /** Start collecting console errors — call once before navigation. */
  startConsoleCollection(): void {
    this.consoleErrors = [];
    this.failedDocumentUrls.clear();
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push({ text: msg.text(), url: msg.location().url });
      }
    });
    this.page.on('response', (response) => {
      const request = response.request();
      if (
        response.status() >= 400 &&
        request.isNavigationRequest() &&
        request.frame() === this.page.mainFrame()
      ) {
        this.failedDocumentUrls.add(response.url());
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
    const unexpected = this.consoleErrors
      .filter((err) => !this.isIgnoredConsoleError(err))
      .map((err) => (err.url ? `${err.text} [${err.url}]` : err.text));
    expect(unexpected, `Unexpected console errors: ${unexpected.join(', ')}`).toHaveLength(0);
  }

  private isIgnoredConsoleError(err: { text: string; url: string }): boolean {
    const cfg = universalChecksConfig.checks.consoleErrors;
    if (cfg.ignorePatterns.some((p) => p.test(err.text))) return true;

    // Only network "Failed to load resource" errors are eligible for the URL-based filters
    // below; JavaScript errors raised by the app are always reported.
    if (!err.text.startsWith('Failed to load resource') || !err.url) return false;

    if (cfg.ignoreResourceUrlPatterns.some((p) => p.test(err.url))) return true;
    if (cfg.ignoreSpaFallbackDocument404 && this.failedDocumentUrls.has(err.url)) return true;
    if (cfg.ignoreThirdPartyResources) {
      try {
        const appOrigin = new URL(this.page.url()).origin;
        if (new URL(err.url).origin !== appOrigin) return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  private async checkBrokenImages(): Promise<void> {
    const broken = await this.page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img')).filter((img) => img.src);
      // Give images that are still downloading a chance to finish; an image that is merely
      // in flight also reports naturalWidth === 0 and must not be counted as broken.
      await Promise.all(
        imgs
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
                setTimeout(resolve, 5000);
              }),
          ),
      );
      return imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src);
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

    // Audit the page at rest: the test's last click/tap can leave the pointer over a link whose
    // :hover colours would otherwise be what axe measures for colour contrast.
    await this.page.mouse.move(0, 0);
    const results = await new AxeBuilder({ page: this.page }).analyze();
    const violations = results.violations.filter((v) => impactLevels.includes(v.impact ?? ''));
    expect(
      violations.map(
        (v) => `${v.id}: ${v.description} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
      ),
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
