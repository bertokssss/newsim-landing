/**
 * NEWSIM Public Landing Website — Portal URL Configuration
 *
 * For production Vercel deployments, populate the deployed Vercel URLs below
 * (or set the <meta name="newsim-*-url"> tags in index.html).
 * When left empty:
 * - On localhost / 127.0.0.1: automatically connects to local ports (3000, 3001, 3002).
 * - On Vercel (*.vercel.app) or custom domains: automatically resolves sibling portal domains
 *   unless explicitly overridden here.
 */
window.NEWSIM_PORTALS = Object.assign(
  {
    trainee: '',
    instructor: '',
    management: '',
  },
  window.NEWSIM_PORTALS || {}
);
