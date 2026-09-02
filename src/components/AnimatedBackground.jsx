import React, { useEffect, useRef, memo } from 'react';

/**
 * Next-Gen Animated Background for DSFRUTAR-2K26
 * Features:
 * - Dynamic interactive constellation network with elastic particle physics
 * - Rotating futuristic cyber shards & elemental energy glyphs (Ds, Fr, 2K26, ⌬, ⚡)
 * - Volumetric multi-spectral aurora nebula with breathing pulses
 * - Mouse repel/attraction interactive forcefield
 * - Compositor-optimized 60fps canvas rendering
 */
export default memo(function AnimatedBackground({ phase = 'phase1' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000 };

        const handleMouseMove = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
            if (clientX !== undefined && clientY !== undefined) {
                mouse.targetX = clientX;
                mouse.targetY = clientY;
            }
        };

        const handleMouseLeave = () => {
            mouse.targetX = -2000;
            mouse.targetY = -2000;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleMouseMove, { passive: true });
        window.addEventListener('touchstart', handleMouseMove, { passive: true });
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchend', handleMouseLeave);

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (!canvas) return;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }, 120);
        };

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('resize', handleResize);

        // Color palettes per phase
        const PALETTES = {
            phase1: { // Briefing / General Hub: Electric Emerald + Cyber Cyan + Gold
                primary: '0, 255, 102',
                secondary: '0, 240, 255',
                accent: '255, 215, 0',
                ambient: 'rgba(0, 255, 102, 0.03)',
            },
            phase2: { // Standby / Telemetry Pending: Cyber Cyan + Amber Gold
                primary: '0, 240, 255',
                secondary: '255, 200, 0',
                accent: '0, 255, 102',
                ambient: 'rgba(0, 240, 255, 0.03)',
            },
            phase3: { // Countdown / High-Energy: Radiant Gold + Crimson + Emerald
                primary: '255, 215, 0',
                secondary: '255, 70, 70',
                accent: '0, 255, 102',
                ambient: 'rgba(255, 215, 0, 0.04)',
            },
            phase4: { // Problem Workspace: Neon Matrix Emerald + Cyber Blue
                primary: '0, 255, 128',
                secondary: '56, 189, 248',
                accent: '250, 204, 21',
                ambient: 'rgba(0, 255, 128, 0.03)',
            },
            phase5: { // Roadmap / Cosmic Helix: Ultraviolet + Electric Cyan + Emerald
                primary: '168, 85, 247',
                secondary: '0, 240, 255',
                accent: '0, 255, 102',
                ambient: 'rgba(168, 85, 247, 0.03)',
            }
        };

        const activePalette = PALETTES[phase] || PALETTES.phase1;
        const GLYPHS = ['Ds', 'Fr', '2K26', '⌬', '⚡', 'λ', '⌘', '110', '87', '01'];

        // Particle generator
        const isMobile = window.innerWidth < 768;
        const NODE_COUNT = isMobile ? 15 : 30;
        const SHARD_COUNT = isMobile ? 5 : 12;

        const nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            const colors = [activePalette.primary, activePalette.secondary, activePalette.accent];
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * (isMobile ? 0.6 : 0.9),
                vy: (Math.random() - 0.5) * (isMobile ? 0.6 : 0.9),
                baseSize: Math.random() * 2.5 + 1.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.03 + 0.015,
            });
        }

        const shards = [];
        for (let i = 0; i < SHARD_COUNT; i++) {
            const colors = [activePalette.primary, activePalette.accent, activePalette.secondary];
            shards.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.7,
                vy: -(Math.random() * 1.2 + 0.3), // gentle upward float
                size: Math.random() * 8 + 6,
                angle: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.03,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.3,
                glyph: Math.random() > 0.4 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
                sides: Math.random() > 0.5 ? 6 : 4, // Hexagon or Diamond
            });
        }

        let time = 0;

        const render = () => {
            time += 0.016;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smooth mouse interpolation
            mouse.x += (mouse.targetX - mouse.x) * 0.1;
            mouse.y += (mouse.targetY - mouse.y) * 0.1;

            // 1. Draw Constellation Network Connections
            const maxDistance = isMobile ? 95 : 140;
            const maxDistanceSq = maxDistance * maxDistance;

            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];

                // Move nodes
                n1.x += n1.vx;
                n1.y += n1.vy;

                // Bounce from bounds with padding
                if (n1.x < 0 || n1.x > canvas.width) n1.vx *= -1;
                if (n1.y < 0 || n1.y > canvas.height) n1.vy *= -1;

                // Mouse interaction (gentle attraction / repel)
                if (mouse.x > -500) {
                    const dx = n1.x - mouse.x;
                    const dy = n1.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 22500) { // 150px radius
                        const dist = Math.sqrt(distSq);
                        const force = (150 - dist) / 150;
                        n1.x += (dx / dist) * force * 2.5;
                        n1.y += (dy / dist) * force * 2.5;
                    }
                }

                // Connect to other nodes
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < maxDistanceSq) {
                        const dist = Math.sqrt(distSq);
                        const alpha = (1 - dist / maxDistance) * 0.35;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${n1.color}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }

                // Connect node to mouse cursor if near
                if (mouse.x > -500) {
                    const dx = n1.x - mouse.x;
                    const dy = n1.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 32400) { // 180px
                        const dist = Math.sqrt(distSq);
                        const alpha = (1 - dist / 180) * 0.6;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${activePalette.primary}, ${alpha})`;
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }

            // 2. Draw Nodes
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const pulse = Math.sin(time * 3 + n.pulseOffset) * 0.5 + 1;
                const size = n.baseSize * pulse;

                ctx.beginPath();
                ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${n.color}, 0.85)`;
                ctx.fill();

                // Subtle inner halo for primary nodes
                if (n.baseSize > 2) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, size * 2.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${n.color}, 0.15)`;
                    ctx.fill();
                }
            }

            // 3. Draw Floating Prismatic Shards & Elemental Glyphs
            for (let i = 0; i < shards.length; i++) {
                const s = shards[i];
                s.x += s.vx + Math.sin(time + i) * 0.4;
                s.y += s.vy;
                s.angle += s.vRot;

                // Wrap around screen
                if (s.y < -30) {
                    s.y = canvas.height + 20;
                    s.x = Math.random() * canvas.width;
                }
                if (s.x < -30) s.x = canvas.width + 20;
                if (s.x > canvas.width + 30) s.x = -20;

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.angle);

                if (s.glyph) {
                    // Draw glowing cyber text glyph
                    ctx.font = `bold ${Math.floor(s.size * 1.5)}px "Orbitron", monospace`;
                    ctx.fillStyle = `rgba(${s.color}, ${s.opacity * 0.7})`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(s.glyph, 0, 0);
                } else {
                    // Draw geometric crystal polygon (Diamond or Hexagon)
                    ctx.beginPath();
                    const radius = s.size;
                    const sides = s.sides;
                    for (let step = 0; step < sides; step++) {
                        const rot = (step * 2 * Math.PI) / sides;
                        const px = Math.cos(rot) * radius;
                        const py = Math.sin(rot) * radius;
                        if (step === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = `rgba(${s.color}, ${s.opacity * 0.7})`;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();

                    ctx.fillStyle = `rgba(${s.color}, ${s.opacity * 0.08})`;
                    ctx.fill();
                }

                ctx.restore();
            }

            if (!document.hidden) {
                animationFrameId = window.requestAnimationFrame(render);
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = window.requestAnimationFrame(render);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        animationFrameId = window.requestAnimationFrame(render);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchstart', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchend', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(resizeTimeout);
            cancelAnimationFrame(animationFrameId);
        };
    }, [phase]);

    return (
        <>
            {/* Multi-layered Cyber Backdrop with Neon Glow Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05070B]">
                {/* Top-Left Ambient Nebula Glow */}
                <div 
                    className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] rounded-full blur-[80px] transform-gpu opacity-25 transition-all duration-1000"
                    style={{
                        background: phase === 'phase3' 
                            ? 'radial-gradient(circle, rgba(0,255,255,0.6) 0%, rgba(239,68,68,0.2) 60%, transparent 80%)'
                            : phase === 'phase5'
                            ? 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(0,240,255,0.2) 60%, transparent 80%)'
                            : 'radial-gradient(circle, rgba(0,255,255,0.5) 0%, rgba(0,240,255,0.2) 60%, transparent 80%)'
                    }}
                />

                {/* Bottom-Right Ambient Nebula Glow */}
                <div 
                    className="absolute -bottom-[20%] -right-[10%] w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] rounded-full blur-[80px] transform-gpu opacity-20 transition-all duration-1000"
                    style={{
                        background: phase === 'phase3'
                            ? 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(0,255,255,0.2) 60%, transparent 80%)'
                            : 'radial-gradient(circle, rgba(0,240,255,0.5) 0%, rgba(0,255,255,0.2) 60%, transparent 80%)'
                    }}
                />

                {/* Subtle Cyber Perspective Grid */}
                <div 
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0, 255, 102, 0.3) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 255, 102, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Scanline CRT texture */}
                <div className="absolute inset-0 bg-black/10 crt-flicker pointer-events-none" />
            </div>

            {/* Dynamic Interactive Constellation & Shard Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-0 pointer-events-none w-full h-full mix-blend-screen"
                style={{ willChange: 'transform' }}
            />
        </>
    );
});
