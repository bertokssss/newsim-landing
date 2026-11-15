document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ocean-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;
    let time = 0;
    let isVisible = true;
    let rafId;

    const colors = [
        'rgba(31, 95, 139, 0.15)',
        'rgba(95, 168, 211, 0.1)',
        'rgba(216, 196, 165, 0.08)'
    ];

    const waves = [
        { amplitude: 20, frequency: 0.01, speed: 0.02, amplitude2: 10, frequency2: 0.02, speed2: 0.01 },
        { amplitude: 15, frequency: 0.015, speed: 0.025, amplitude2: 8, frequency2: 0.03, speed2: 0.015 },
        { amplitude: 25, frequency: 0.008, speed: 0.015, amplitude2: 12, frequency2: 0.015, speed2: 0.008 }
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, width, height);
        time++;

        waves.forEach((wave, index) => {
            ctx.beginPath();
            ctx.moveTo(0, height);
            
            const centerY = height - (index + 1) * 30;

            for (let x = 0; x <= width; x += 10) {
                const y = centerY + 
                    wave.amplitude * Math.sin(x * wave.frequency + time * wave.speed) + 
                    wave.amplitude2 * Math.sin(x * wave.frequency2 + time * wave.speed2);
                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fillStyle = colors[index];
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
