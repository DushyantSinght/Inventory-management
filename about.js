document.addEventListener('DOMContentLoaded', () => {
    // Hero Section Particles
    function createHeroParticles() {
        const canvas = document.getElementById('hero-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const particles = [];
        const particleCount = 150;
        const isDarkMode = document.body.classList.contains('dark-mode');

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                color: isDarkMode ?
                    `rgba(0, 255, 204, ${Math.random() * 0.5 + 0.2})` :
                    `rgba(255, 107, 107, ${Math.random() * 0.5 + 0.2})`,
                speedX: Math.random() * 0.3 - 0.15,
                speedY: Math.random() * 0.3 - 0.15
            });
        }

        function drawParticles() {
            if (!canvas.parentNode) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            });

            requestAnimationFrame(drawParticles);
        }

        drawParticles();

        window.addEventListener('resize', () => {
            if (canvas.parentNode) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
        });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !message) {
            showAlert('Please fill in all fields.', 'error');
            return;
        }

        showAlert('Message sent successfully! We will get back to you soon.', 'success');
        contactForm.reset();
    });

    // Initialize Particles
    createHeroParticles();
});