document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;
    let particles = [];
    let isVisible = true;
    let rafId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
        initParticles();
    }

    function initParticles() {
        particles = [];
        const numParticles = 30;
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 1,
                opacity: Math.random() * 0.3 + 0.1,
                speed: Math.random() * 0.3 + 0.2
            });
        }
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });

        rafId = requestAnimationFrame(draw);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                draw();
            } else {
                cancelAnimationFrame(rafId);
            }
        });
    });

    observer.observe(canvas);
});
