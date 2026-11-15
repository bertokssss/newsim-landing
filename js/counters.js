/**
 * counters.js
 * Animated number counters with dynamic Supabase statistics fetching
 */
document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://decsaytnrckqiuumtzes.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_hP-uwPEuUpc0wv4i4dGIuw_aRt5ZU89';

    // Track which elements have already animated
    const animatedElements = new Set();
    // Keep active animation cancel tokens
    const runningAnimations = new Map();

    function animateCounter(element) {
        const targetAttr = element.getAttribute('data-count');
        if (!targetAttr) return;
        const target = parseInt(targetAttr.replace(/,/g, ''), 10);
        if (isNaN(target)) return;
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000;
        const start = performance.now();

        // Cancel previous animation on this element if any
        if (runningAnimations.has(element)) {
            cancelAnimationFrame(runningAnimations.get(element));
        }

        // Get starting value if already partially rendered
        const currentText = (element.textContent || '').replace(/[^\d]/g, '');
        const startVal = currentText ? parseInt(currentText, 10) || 0 : 0;
        
        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.floor(startVal + eased * (target - startVal));
            element.textContent = current.toLocaleString() + suffix;
            
            if (progress < 1) {
                const animId = requestAnimationFrame(update);
                runningAnimations.set(element, animId);
            } else {
                element.textContent = target.toLocaleString() + suffix;
                runningAnimations.delete(element);
            }
        }
        const animId = requestAnimationFrame(update);
        runningAnimations.set(element, animId);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animatedElements.add(entry.target);
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const allCounterElements = document.querySelectorAll('[data-count]');
    allCounterElements.forEach(el => observer.observe(el));

    // Fetch dynamic stats from Supabase
    async function fetchSupabaseStats() {
        const endpoints = [
            // Strategy 1: PostgREST RPC get_landing_stats()
            {
                url: `${SUPABASE_URL}/rest/v1/rpc/get_landing_stats`,
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: '{}',
                extract: (res) => res
            },
            // Strategy 2: landing_stats view
            {
                url: `${SUPABASE_URL}/rest/v1/landing_stats?select=*`,
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                extract: (res) => Array.isArray(res) ? res[0] : res
            },
            // Strategy 3: system_settings table
            {
                url: `${SUPABASE_URL}/rest/v1/system_settings?key=eq.landing_stats&select=value`,
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                extract: (res) => Array.isArray(res) && res[0]?.value ? res[0].value : null
            }
        ];

        for (const ep of endpoints) {
            try {
                const response = await fetch(ep.url, {
                    method: ep.method,
                    headers: ep.headers,
                    body: ep.body || undefined
                });

                if (response.ok) {
                    const rawData = await response.json();
                    const stats = ep.extract(rawData);
                    if (stats && (stats.students_trained != null || stats.training_programs != null)) {
                        return stats;
                    }
                }
            } catch (err) {
                // Silently fallback to next endpoint or default values
            }
        }
        return null;
    }

    function applyStats(stats) {
        if (!stats) return;

        const statMapping = {
            'students_trained': stats.students_trained,
            'training_programs': stats.training_programs,
            'training_batches': stats.training_batches,
            'completion_rate': stats.completion_rate
        };

        Object.entries(statMapping).forEach(([key, val]) => {
            if (val == null) return;
            const targetVal = String(val);

            // 1. Match by explicit data-stat
            let targets = document.querySelectorAll(`[data-stat="${key}"]`);

            // 2. Fallback matching by label if data-stat was omitted
            if (!targets.length) {
                const labelKeywords = {
                    'students_trained': ['students trained', 'students'],
                    'training_programs': ['training programs', 'programs'],
                    'training_batches': ['training batches', 'batches'],
                    'completion_rate': ['completion rate', 'completion']
                };
                const keywords = labelKeywords[key] || [];
                targets = Array.from(document.querySelectorAll('[data-count]')).filter(el => {
                    const parentText = (el.closest('.stat-item, .stat-badge')?.textContent || '').toLowerCase();
                    return keywords.some(kw => parentText.includes(kw));
                });
            }

            targets.forEach(el => {
                const previousCount = el.getAttribute('data-count');
                el.setAttribute('data-count', targetVal);

                // If already animated, re-animate to the updated number
                if (animatedElements.has(el) && previousCount !== targetVal) {
                    animateCounter(el);
                }
            });
        });
    }

    // Trigger Supabase fetch immediately on load
    fetchSupabaseStats()
        .then(stats => {
            if (stats) {
                applyStats(stats);
            }
        })
        .catch(() => {
            // Graceful fallback to default values in HTML
        });

    // Expose for testing/debugging
    window.LandingStats = {
        fetch: fetchSupabaseStats,
        apply: applyStats
    };
});

