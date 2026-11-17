/*
 * AIRH MAX - Partículas tecnológicas (red de nodos)
 * Sin dependencias externas. Respeta prefers-reduced-motion,
 * pausa cuando la pestaña no está visible y limita el DPR.
 */
(function () {
    'use strict';

    var canvas = document.getElementById('airh-particles');
    if (!canvas) {
        return;
    }

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
        return;
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var PALETTE = [
        { r: 129, g: 212, b: 250 }, // --airh-accent
        { r: 53,  g: 253, b: 226 }, // --airh-accent-2
        { r: 0,   g: 255, b: 0   }  // --airh-accent-text
    ];

    var CONFIG = {
        density: 0.000075,
        minParticles: 32,
        maxParticles: 92,
        linkDistance: 145,
        mouseRadius: 170,
        maxSpeed: 0.7
    };

    var width = 0;
    var height = 0;
    var dpr = 1;
    var particles = [];
    var rafId = 0;
    var running = false;
    var lastTime = 0;

    var pointer = {
        x: null,
        y: null,
        active: false
    };

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function rgba(color, alpha) {
        return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
    }

    function createParticle() {
        var angle = Math.random() * Math.PI * 2;
        var speed = random(0.06, 0.22);
        var color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: random(0.7, 1.9),
            alpha: random(0.22, 0.6),
            color: color
        };
    }

    function buildParticles() {
        var count = Math.floor(width * height * CONFIG.density);
        count = Math.max(CONFIG.minParticles, Math.min(CONFIG.maxParticles, count));

        particles = [];
        for (var i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function resize() {
        var nextWidth = window.innerWidth || document.documentElement.clientWidth;
        var nextHeight = window.innerHeight || document.documentElement.clientHeight;
        var nextDpr = Math.min(window.devicePixelRatio || 1, 2);

        width = nextWidth;
        height = nextHeight;
        dpr = nextDpr;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildParticles();
        drawFrame(false);
    }

    function updateParticles(delta) {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            if (pointer.active) {
                var dx = pointer.x - p.x;
                var dy = pointer.y - p.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0 && distance < CONFIG.mouseRadius) {
                    var force = (1 - distance / CONFIG.mouseRadius) * 0.012;
                    p.vx += (dx / distance) * force * delta;
                    p.vy += (dy / distance) * force * delta;
                }
            }

            p.x += p.vx * delta;
            p.y += p.vy * delta;

            // Rebote suave en los bordes.
            if (p.x < 0) {
                p.x = 0;
                p.vx = Math.abs(p.vx);
            } else if (p.x > width) {
                p.x = width;
                p.vx = -Math.abs(p.vx);
            }

            if (p.y < 0) {
                p.y = 0;
                p.vy = Math.abs(p.vy);
            } else if (p.y > height) {
                p.y = height;
                p.vy = -Math.abs(p.vy);
            }

            // Limita la velocidad para que el movimiento sea sutil.
            var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > CONFIG.maxSpeed) {
                p.vx = (p.vx / speed) * CONFIG.maxSpeed;
                p.vy = (p.vy / speed) * CONFIG.maxSpeed;
            }
        }
    }

    function drawLinks() {
        for (var i = 0; i < particles.length; i++) {
            var a = particles[i];

            for (var j = i + 1; j < particles.length; j++) {
                var b = particles[j];
                var dx = a.x - b.x;
                var dy = a.y - b.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > CONFIG.linkDistance) {
                    continue;
                }

                var alpha = (1 - distance / CONFIG.linkDistance) * 0.28;
                if (alpha <= 0.01) {
                    continue;
                }

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = rgba(PALETTE[0], alpha);
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }

    function drawPointerLinks() {
        if (!pointer.active) {
            return;
        }

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var dx = pointer.x - p.x;
            var dy = pointer.y - p.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > CONFIG.mouseRadius) {
                continue;
            }

            var alpha = (1 - distance / CONFIG.mouseRadius) * 0.38;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = rgba(PALETTE[1], alpha);
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }

    function drawParticles() {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            // Halo suave.
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = rgba(p.color, p.alpha * 0.08);
            ctx.fill();

            // Núcleo.
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = rgba(p.color, p.alpha);
            ctx.fill();
        }
    }

    function drawFrame(animate, delta) {
        if (animate) {
            updateParticles(delta);
        }

        ctx.clearRect(0, 0, width, height);
        drawLinks();
        drawPointerLinks();
        drawParticles();
    }

    function loop(timestamp) {
        if (!running) {
            return;
        }

        if (!lastTime) {
            lastTime = timestamp;
        }

        // Normaliza a 60 fps y evita saltos tras cambiar de pestaña.
        var delta = Math.min((timestamp - lastTime) / 16.6667, 2.5);
        lastTime = timestamp;

        drawFrame(true, delta);
        rafId = window.requestAnimationFrame(loop);
    }

    function start() {
        if (reduceMotion || running) {
            return;
        }

        running = true;
        lastTime = 0;
        rafId = window.requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function handlePointerMove(event) {
        if (event.pointerType && event.pointerType !== 'mouse') {
            return;
        }

        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    }

    function handlePointerLeave() {
        pointer.active = false;
        pointer.x = null;
        pointer.y = null;
    }

    function handlePointerOut(event) {
        // Solo se desactiva la interacción al salir de la ventana,
        // no al pasar de un elemento HTML a otro.
        if (!event.relatedTarget) {
            handlePointerLeave();
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stop();
        } else if (reduceMotion) {
            drawFrame(false);
        } else {
            start();
        }
    }

    function debounce(fn, wait) {
        var timeoutId = null;
        return function () {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
            timeoutId = window.setTimeout(fn, wait);
        };
    }

    function init() {
        resize();

        window.addEventListener('resize', debounce(function () {
            resize();
            if (!reduceMotion && !running && !document.hidden) {
                start();
            }
        }, 150), { passive: true });

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerout', handlePointerOut, { passive: true });
        window.addEventListener('blur', handlePointerLeave, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Dibuja un primer fotograma aunque la pestaña esté en segundo plano
        // o el navegador retrase requestAnimationFrame.
        drawFrame(false);

        if (!reduceMotion) {
            start();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
