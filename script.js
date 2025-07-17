document.addEventListener("DOMContentLoaded", function() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // --- ЛОГИКА ЧАСТИЦ (CANVAS) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particlesArray = [];
        window.mouse = { x: null, y: null, radius: 150 };

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
                if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
                
                if (!isTouchDevice) {
                    let dx = window.mouse.x - this.x; let dy = window.mouse.y - this.y;
                    if(dx !== null && dy !== null){
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < window.mouse.radius + this.size) {
                            if (window.mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 3; }
                            if (window.mouse.x > this.x && this.x > this.size * 10) { this.x -= 3; }
                            if (window.mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 3; }
                            if (window.mouse.y > this.y && this.y > this.size * 10) { this.y -= 3; }
                        }
                    }
                }
                this.x += this.directionX; this.y += this.directionY; this.draw();
            }
        }

        function initParticles() {
            particlesArray = []; let numberOfParticles = (canvas.height * canvas.width) / 12000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = Math.random() * innerWidth; let y = Math.random() * innerHeight;
                let directionX = isTouchDevice ? 0 : (Math.random() * 0.4) - 0.2;
                let directionY = isTouchDevice ? 0 : (Math.random() * 0.4) - 0.2;
                let color = 'rgba(0, 245, 195, 0.3)';
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            if (!isTouchDevice) {
                requestAnimationFrame(animateParticles);
            }
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        window.addEventListener('resize', () => {
            canvas.width = innerWidth; canvas.height = innerHeight;
            initParticles();
            animateParticles();
        });

        initParticles();
        animateParticles();
    }


    // --- ЛОГИКА КАСТОМНОГО КУРСОРА (ТОЛЬКО ДЛЯ ПК) ---
    if (!isTouchDevice) {
        const cursorDot = document.getElementById('cursor-dot');
        const cursorTrail = document.getElementById('cursor-trail');
        let cursorInitialized = false;

        let trailX = 0, trailY = 0;

        window.addEventListener('mousemove', (e) => {
            if (!cursorInitialized) {
                cursorDot.style.opacity = '1';
                cursorTrail.style.opacity = '1';
                cursorInitialized = true;
            }
            window.mouse.x = e.clientX;
            window.mouse.y = e.clientY;
            
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });
        
        const animateTrail = () => {
            if (cursorInitialized) {
                trailX += (window.mouse.x - trailX) * 0.2;
                trailY += (window.mouse.y - trailY) * 0.2;
                cursorTrail.style.left = trailX + 'px';
                cursorTrail.style.top = trailY + 'px';
            }
            requestAnimationFrame(animateTrail);
        }
        animateTrail();
    }


    // --- ЛОГИКА МОБИЛЬНОГО МЕНЮ (БУРГЕР) ---
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const togglerIcon = navbarToggler ? navbarToggler.querySelector('i') : null;

    if (navbarToggler && navbarCollapse && togglerIcon) {
        navbarToggler.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
            document.documentElement.classList.toggle('menu-open');

            togglerIcon.classList.toggle('bi-list');
            togglerIcon.classList.toggle('bi-x');
        });
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('menu-open')) {
                    navbarToggler.click();
                }
            });
        });
    }

    // --- СКРОЛЛ НАВБАРА ---
    const navbar = document.querySelector('.navbar');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- АНИМАЦИЯ ПОЯВЛЕНИЯ КОНТЕНТА ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- 3D ЭФФЕКТ НА КАРТОЧКАХ ПОРТФОЛИО (ТОЛЬКО ДЛЯ ПК) ---
    if (!isTouchDevice) {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const centerX = rect.width / 2; const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20; const rotateY = (centerX - x) / 20;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    // --- ПЕЧАТНЫЙ ТЕКСТ ---
    const typedTextSpan = document.querySelector(".typed-text");
    const cursorSpan = document.querySelector(".cursor");
    if (typedTextSpan && cursorSpan) {
        const textArray = ["веб-разработчик.", "энтузиаст своего дела.", "превращаю идеи в код."];
        const typingDelay = 100, erasingDelay = 50, newTextDelay = 2000;
        let textArrayIndex = 0, charIndex = 0;
        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, typingDelay);
            } else {
                cursorSpan.classList.add('blinking');
                setTimeout(erase, newTextDelay);
            }
        }
        function erase() {
            cursorSpan.classList.remove('blinking');
            if (charIndex > 0) {
                typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
                charIndex--;
                setTimeout(erase, erasingDelay);
            } else {
                textArrayIndex++;
                if (textArrayIndex >= textArray.length) textArrayIndex = 0;
                setTimeout(type, typingDelay + 1100);
            }
        }
        setTimeout(type, newTextDelay + 250);
    }
});