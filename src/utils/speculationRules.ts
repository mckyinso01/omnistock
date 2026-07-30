/**
 * Speculation Rules API Helper for 0ms OmniStock POS Navigation
 */
export function injectOmnistockSpeculationRules() {
  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const specScript = document.createElement('script');
    specScript.type = 'speculationrules';
    specScript.textContent = JSON.stringify({
      prerender: [
        {
          source: 'list',
          urls: ['/pos', '/inventory', '/analytics', '/suppliers'],
          eagerness: 'immediate'
        }
      ]
    });
    document.head.appendChild(specScript);
  }
}
