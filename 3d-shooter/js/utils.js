/**
 * Utility functions for the 3D Shooter game
 */

// Random number between min and max (inclusive)
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Random integer between min and max (inclusive)
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Linear interpolation
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Create a simple explosion effect at the given position
function createExplosion(scene, position, size = 1, color = 0xff5500) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Random position within a sphere
        const radius = size * 0.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = position.x + radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = position.z + radius * Math.cos(phi);
        
        // Color with slight variation
        colors[i3] = colorObj.r;
        colors[i3 + 1] = colorObj.g;
        colors[i3 + 2] = colorObj.b;
        
        // Random size
        sizes[i] = size * (0.5 + Math.random() * 0.5);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: size * 0.5,
        color: color,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animation
    const startTime = Date.now();
    const duration = 1000; // 1 second
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            scene.remove(particles);
            particles.geometry.dispose();
            particles.material.dispose();
            return;
        }
        
        // Expand particles
        const newPositions = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const dirX = newPositions[i3] - position.x;
            const dirY = newPositions[i3 + 1] - position.y;
            const dirZ = newPositions[i3 + 2] - position.z;
            
            newPositions[i3] += dirX * 0.05;
            newPositions[i3 + 1] += dirY * 0.05;
            newPositions[i3 + 2] += dirZ * 0.05;
        }
        geometry.attributes.position.needsUpdate = true;
        
        // Fade out
        material.opacity = 1 - progress;
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    return particles;
}

// Create a simple flash effect at the given position
function createFlash(scene, position, size = 1, color = 0xffffff, duration = 200) {
    const light = new THREE.PointLight(color, 2, size * 10);
    light.position.copy(position);
    scene.add(light);
    
    // Animation
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            scene.remove(light);
            return;
        }
        
        // Fade out
        light.intensity = 2 * (1 - progress);
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    return light;
}

// Show a temporary message in the center of the screen
function showMessage(message, duration = 2000, color = '#ffffff') {
    const messageElement = document.createElement('div');
    messageElement.style.position = 'fixed';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.color = color;
    messageElement.style.fontSize = '32px';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.7)';
    messageElement.style.zIndex = '500';
    messageElement.style.textAlign = 'center';
    messageElement.style.pointerEvents = 'none';
    messageElement.innerHTML = message;
    
    document.body.appendChild(messageElement);
    
    // Animation
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            document.body.removeChild(messageElement);
            return;
        }
        
        // Fade in/out
        let opacity = 1;
        if (progress < 0.2) {
            opacity = progress / 0.2; // Fade in during first 20%
        } else if (progress > 0.8) {
            opacity = (1 - progress) / 0.2; // Fade out during last 20%
        }
        
        messageElement.style.opacity = opacity;
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Show boss warning
function showBossWarning() {
    const warningElement = document.createElement('div');
    warningElement.className = 'boss-warning';
    warningElement.innerHTML = 'WARNING: BOSS APPROACHING';
    document.body.appendChild(warningElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(warningElement);
    }, 3000);
}

// Create a simple particle trail
function createParticleTrail(scene, object, color = 0x3366ff, count = 20) {
    const particles = [];
    const maxAge = 1000; // 1 second
    
    // Create initial particles
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.visible = false;
        particle.age = 0;
        particle.maxAge = maxAge;
        particle.creationTime = Date.now() - (i * (maxAge / count)); // Stagger creation times
        
        scene.add(particle);
        particles.push(particle);
    }
    
    // Update function to be called in animation loop
    function update() {
        const time = Date.now();
        
        for (const particle of particles) {
            const age = time - particle.creationTime;
            
            if (age > particle.maxAge) {
                // Reset particle
                particle.position.copy(object.position);
                particle.position.z += 1; // Behind the object
                particle.creationTime = time;
                particle.visible = true;
                particle.scale.set(1, 1, 1);
                particle.material.opacity = 0.7;
            } else {
                // Age particle
                const progress = age / particle.maxAge;
                particle.material.opacity = 0.7 * (1 - progress);
                particle.scale.set(1 - progress, 1 - progress, 1 - progress);
            }
        }
    }
    
    // Cleanup function
    function dispose() {
        for (const particle of particles) {
            scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        }
        particles.length = 0;
    }
    
    return { update, dispose };
}

// Shake the camera
function shakeCamera(camera, intensity = 0.2, duration = 200) {
    const originalPosition = camera.position.clone();
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            camera.position.copy(originalPosition);
            return;
        }
        
        // Apply random offset that decreases with time
        const remainingIntensity = intensity * (1 - progress);
        camera.position.set(
            originalPosition.x + (Math.random() - 0.5) * remainingIntensity,
            originalPosition.y + (Math.random() - 0.5) * remainingIntensity,
            originalPosition.z + (Math.random() - 0.5) * remainingIntensity
        );
        
        requestAnimationFrame(animate);
    }
    
    animate();
}