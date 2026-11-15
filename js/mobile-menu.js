document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const links = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    if (!toggle || !mobileMenu) return;

    function toggleMenu() {
        const isActive = mobileMenu.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.classList.toggle('body-no-scroll', isActive);
    }

    function closeMenu() {
        mobileMenu.classList.remove('active');
        toggle.classList.remove('active');
        document.body.classList.remove('body-no-scroll');
    }

    toggle.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
});
