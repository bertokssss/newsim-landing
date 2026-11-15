document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.magnetic');
    
    if (window.innerWidth <= 1024) return;
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const maxOffset = 10;
            const offsetX = Math.max(-maxOffset, Math.min(maxOffset, x * 0.3));
            const offsetY = Math.max(-maxOffset, Math.min(maxOffset, y * 0.3));
            
            btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
            btn.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                btn.style.transition = '';
            }, 300);
        });
    });
});
