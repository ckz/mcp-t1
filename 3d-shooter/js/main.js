/**
 * Main entry point for the 3D Shooter game
 */
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = loadingScreen.querySelector('.progress-value');
    const loadingText = loadingScreen.querySelector('.loading-text');
    
    // Create loading manager to track progress
    const loadingManager = new THREE.LoadingManager();
    
    loadingManager.onProgress = (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        progressBar.style.width = `${progress}%`;
        loadingText.textContent = `Loading assets... ${Math.round(progress)}%`;
    };
    
    loadingManager.onLoad = () => {
        // Hide loading screen with a fade out
        loadingScreen.style.opacity = 0;
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            
            // Initialize game
            window.game = new Game();
        }, 500);
    };
    
    loadingManager.onError = (url) => {
        console.error(`Error loading ${url}`);
        loadingText.textContent = `Error loading assets. Please refresh the page.`;
    };
    
    // Preload assets
    preloadAssets(loadingManager);
});

/**
 * Preload game assets
 * @param {THREE.LoadingManager} loadingManager - Loading manager
 */
function preloadAssets(loadingManager) {
    // Create loaders
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const audioLoader = new THREE.AudioLoader(loadingManager);
    
    // Load textures
    const textures = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' // Dummy texture
    ];
    
    textures.forEach(url => {
        textureLoader.load(url, () => {
            // Texture loaded
        });
    });
    
    // Simulate loading more assets
    setTimeout(() => {
        loadingManager.onLoad();
    }, 1000);
}

/**
 * Handle errors
 */
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.style.position = 'fixed';
    errorMessage.style.top = '10px';
    errorMessage.style.left = '10px';
    errorMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorMessage.style.color = 'white';
    errorMessage.style.padding = '10px';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.zIndex = '1000';
    errorMessage.textContent = `Error: ${event.error.message}`;
    document.body.appendChild(errorMessage);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        document.body.removeChild(errorMessage);
    }, 5000);
});