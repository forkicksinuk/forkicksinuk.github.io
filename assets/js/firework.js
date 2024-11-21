// Create canvas and get context with error handling
let canvas = document.createElement('canvas');
let ctx;

try {
    console.log('Creating canvas element...');
    // Set canvas style
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';  // Allow clicks to pass through
    canvas.style.zIndex = '9999';  // Ensure canvas is above other elements
    
    document.body.appendChild(canvas);
    console.log('Canvas appended to document body');
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }
    console.log('Canvas context obtained successfully');
} catch (error) {
    console.error('Canvas initialization failed:', error);
}

// Set initial canvas size
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
updateCanvasSize();

// Handle window resize
window.addEventListener('resize', updateCanvasSize);

let particleNumber = 30;
let fireworks = [];
let velocity = 2; // Increased velocity for more visible effect
let baseTransparency = 1;
let animationId = null;

// Ensure the script runs after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing click listener');
    document.addEventListener('click', (e) => {
        let x = e.clientX;
        let y = e.clientY;
        
        // Stop any existing animation
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        fireworks = []; // Clear old particles
        conduct(x, y);
        animate();
    });
});

function conduct(x, y) {
    for(let i = 0; i < particleNumber; i++) {
        fireworks.push({
            x: x,
            y: y,
            angle: Math.random() * Math.PI * 2, // Full circle
            velocity: velocity + Math.random() * 2, // More varied velocities
            transparency: baseTransparency,
            color: `hsl(${Math.random() * 360}, 70%, 50%)` // More saturated colors
        });
    }
}

function animate() {
    // Only continue if we have particles
    if (fireworks[0].transparency === 0) {
        animationId = null;
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    fireworks.forEach((particle, index) => {
        particle.x += Math.cos(particle.angle) * particle.velocity;
        particle.y += Math.sin(particle.angle) * particle.velocity;
        
        particle.transparency -= 0.02;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2); // Slightly larger particles
        ctx.fillStyle = particle.color.replace('hsl', 'hsla').replace(')', `, ${particle.transparency})`);
        ctx.fill();
    });
    
    // Remove particles with low transparency
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}
