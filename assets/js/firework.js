(function() {
    // 常量定义
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const PARTICLE_COUNT = isMobile ? 20 : 40;
    const COLORS = [ '#ff3', '#f62', '#f23', '#fff', '#007bff', '#28a745', '#ff69b4', '#ffd700', '#800080', '#ffa500'];
    const MAX_FIREWORKS = 3;
    const FPS = 60;
    const frameInterval = 1000 / FPS;
  
    // Canvas设置
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);
  
    const ctx = canvas.getContext('2d', { alpha: true });
  
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    }
  
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  
    // 粒子类
    class Particle {
      constructor(x, y, color) {
        this.reset(x, y, color);
      }
  
      reset(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.02;
        this.size = Math.random() * 2 + 1;
      }
  
      update() {
        this.velocity.y += 0.1;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }
  
      draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    // 状态变量
    let particles = [];
    let particlePool = [];
    let lastTime = 0;
  
    // 对象池管理
    function getParticle(x, y, color) {
      if (particlePool.length > 0) {
        const particle = particlePool.pop();
        particle.reset(x, y, color);
        return particle;
      }
      return new Particle(x, y, color);
    }
  
    // 节流函数
    function throttle(func, limit) {
      let lastTime = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastTime >= limit) {
          lastTime = now;
          func.apply(this, args);
        }
      }
    }
  
    // 创建烟花
    function createFirework(x, y) {
      if (particles.length > MAX_FIREWORKS * PARTICLE_COUNT) return;
  
      // 使用 setTimeout 替换 requestIdleCallback
      setTimeout(() => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          particles.push(getParticle(x, y, color));
        }
      }, 0); // 设置延迟时间为 0，立即执行
    }
  
    // 动画循环
    function animate(currentTime) {
      requestAnimationFrame(animate);
  
      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      lastTime = currentTime - (deltaTime % frameInterval);
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.update()) {
          particle.draw(ctx);
        } else {
          particles.splice(i, 1);
          particlePool.push(particle);
        }
      }
    }
  
    // 点击处理，节流时间改为 10 毫秒
    const throttledClick = throttle((e) => {
      let element = e.target;
      while (element) {
        if (element.tagName === 'A') return;
        element = element.parentElement;
      }
      createFirework(e.clientX, e.clientY);
    }, 10); // 将延迟时间改为 10 毫秒
  
    // 事件监听
    document.addEventListener('click', throttledClick, { passive: true });
  
    // 启动动画
    animate(0);
  })();