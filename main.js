const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let shootingStars = [];

// Configuração
const CONFIG = {
    starCount: 400,
    starColors: ['#ffffff', '#ffe9c4', '#d4fbff', '#ffd2a1'],
    minSize: 0.5,
    maxSize: 2.5,
    twinkleSpeed: 0.02
};

// Redimensionar canvas
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
}

// Classe Estrela
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
        this.color = CONFIG.starColors[Math.floor(Math.random() * CONFIG.starColors.length)];
        this.opacity = Math.random();
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = (Math.random() * 0.5 + 0.5) * CONFIG.twinkleSpeed;
        this.baseOpacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        // Efeito de cintilação
        this.twinklePhase += this.twinkleSpeed;
        this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;
        this.opacity = Math.max(0.1, Math.min(1, this.opacity));
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();

        // Brilho suave para estrelas maiores
        if (this.size > 1.5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 2
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = this.opacity * 0.3;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }
}

// Classe Estrela Cadente
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 15 + 10;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.opacity = 1;
        this.active = false;
        this.trail = [];
    }

    activate() {
        this.active = true;
        this.x = Math.random() * width * 0.8;
        this.y = Math.random() * height * 0.3;
        this.opacity = 1;
        this.trail = [];
    }

    update() {
        if (!this.active) return;

        this.trail.unshift({ x: this.x, y: this.y, opacity: this.opacity });

        if (this.trail.length > 20) {
            this.trail.pop();
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.02;

        if (this.opacity <= 0 || this.x > width || this.y > height) {
            this.active = false;
            this.reset();
        }
    }

    draw() {
        if (!this.active) return;

        // Desenhar rastro
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const trailOpacity = (1 - i / this.trail.length) * point.opacity * 0.5;
            const trailSize = (1 - i / this.trail.length) * 2;

            ctx.beginPath();
            ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = trailOpacity;
            ctx.fill();
        }

        // Desenhar estrela principal
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = this.opacity;
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

// Inicializar estrelas
function initStars() {
    stars = [];
    for (let i = 0; i < CONFIG.starCount; i++) {
        stars.push(new Star());
    }

    shootingStars = [];
    for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
    }
}

// Disparar estrela cadente aleatoriamente
function triggerShootingStar() {
    const inactive = shootingStars.find(s => !s.active);
    if (inactive) {
        inactive.activate();
    }
}

// Animação principal
function animate() {
    // Limpar com gradiente do céu noturno
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a14');
    gradient.addColorStop(0.5, '#0d0d1a');
    gradient.addColorStop(1, '#0a0a14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Atualizar e desenhar estrelas
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Atualizar e desenhar estrelas cadentes
    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(animate);
}

// Disparar estrelas cadentes periodicamente
setInterval(() => {
    if (Math.random() > 0.5) {
        triggerShootingStar();
    }
}, 3000);

// Event listeners
window.addEventListener('resize', resize);

// Iniciar
resize();
animate();
