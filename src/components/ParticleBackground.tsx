import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  theme: 'astrolabe' | 'cosmos';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let butterflies: Butterfly[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Butterfly {
      x: number;
      y: number;
      size: number;
      speed: number;
      angle: number;
      flapSpeed: number;
      time: number;
      opacity: number;
      targetAngle: number;
      angleChangeTimer: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 3.5; // 3.5 to 6.5
        this.speed = Math.random() * 0.6 + 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.flapSpeed = Math.random() * 0.08 + 0.08;
        this.time = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
        this.angleChangeTimer = 0;
      }

      update() {
        this.time += this.flapSpeed;
        
        // erratic angle change for natural flight
        this.angleChangeTimer--;
        if (this.angleChangeTimer <= 0) {
          this.targetAngle += (Math.random() - 0.5) * 1.5;
          this.angleChangeTimer = Math.random() * 150 + 50;
        }
        
        // smooth rotate towards target
        const diff = this.targetAngle - this.angle;
        this.angle += diff * 0.02;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // wrapping
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        const flap = Math.max(0.1, Math.abs(Math.sin(this.time))); // simulate 3d flap

        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00E5FF'; // Cyan glow
        ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity})`; // Cyan/Celeste

        ctx.beginPath();
        // Top right wing
        ctx.ellipse(this.size * flap, -this.size * 0.5, this.size * flap, this.size, Math.PI / 6, 0, Math.PI * 2);
        // Bottom right wing
        ctx.ellipse(this.size * flap * 0.8, this.size * 0.8, this.size * flap * 0.7, this.size * 0.9, -Math.PI / 8, 0, Math.PI * 2);
        
        // Top left wing
        ctx.ellipse(-this.size * flap, -this.size * 0.5, this.size * flap, this.size, -Math.PI / 6, 0, Math.PI * 2);
        // Bottom left wing
        ctx.ellipse(-this.size * flap * 0.8, this.size * 0.8, this.size * flap * 0.7, this.size * 0.9, Math.PI / 8, 0, Math.PI * 2);
        
        ctx.fill();
        ctx.restore();
      }
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacitySpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3 - 0.2; // slight upward drift
        this.opacity = Math.random();
        this.opacitySpeed = (Math.random() - 0.5) * 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += this.opacitySpeed;

        if (this.opacity <= 0.1 || this.opacity >= 0.8) {
          this.opacitySpeed = -this.opacitySpeed;
        }

        if (this.y < 0) this.y = canvas.height;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // #D4AF37 Gold
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      butterflies = [];
      
      const numParticles = Math.floor((canvas.width * canvas.height) / 10000); // Responsive particle count
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
      
      const numButterflies = theme === 'cosmos' ? 0 : Math.max(3, Math.floor(canvas.width / 400)); // Around 3-8 butterflies
      for (let i = 0; i < numButterflies; i++) {
        butterflies.push(new Butterfly());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      
      if (theme !== 'cosmos') {
        for (const butterfly of butterflies) {
          butterfly.update();
          butterfly.draw();
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // Add theme as dependency so it re-inits when theme changes

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
