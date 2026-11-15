document.addEventListener('DOMContentLoaded', () => {
    const navPill = document.getElementById('animated-nav-pill');
    if (!navPill) return;

    let isExpanded = true;
    let lastScrollY = window.scrollY;
    let scrollPositionOnCollapse = 0;
    const EXPAND_SCROLL_THRESHOLD = 80;

    window.addEventListener('scroll', () => {
        const latest = window.scrollY;
        
        if (isExpanded && latest > lastScrollY && latest > 150) {
            isExpanded = false;
            navPill.classList.add('collapsed');
            scrollPositionOnCollapse = latest;
        } 
        else if (!isExpanded && latest < lastScrollY && (scrollPositionOnCollapse - latest > EXPAND_SCROLL_THRESHOLD)) {
            isExpanded = true;
            navPill.classList.remove('collapsed');
        }
        
        // Fallback: If at the absolute bottom of the page, guarantee Contact is active
        if ((window.innerHeight + latest) >= document.body.offsetHeight - 50) {
            const navLinks = document.querySelectorAll('.nav-link-pill');
            navLinks.forEach(link => link.classList.remove('active'));
            const contactLink = document.querySelector('.nav-link-pill[href="#contact"]');
            if (contactLink) contactLink.classList.add('active');
        }
        
        lastScrollY = latest;
    });

    navPill.addEventListener('click', (e) => {
        // If clicking while collapsed, expand it.
        // Ignore if clicking a link or hamburger inside it when expanded.
        if (!isExpanded) {
            e.preventDefault();
            isExpanded = true;
            navPill.classList.remove('collapsed');
        }
    });

    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link-pill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5, rootMargin: '-80px 0px 0px 0px' });

    sections.forEach(section => observer.observe(section));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
