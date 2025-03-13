/**
 * Boot Scene
 * First scene that loads, displays loading screen and loads basic assets
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load loading screen assets
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('loading-background', 'assets/images/loading-background.png');
        
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add loading graphics
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
            font: '30px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);
        
        // Loading progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 10);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    create() {
        // Transition to the preload scene
        this.scene.start('PreloadScene');
    }
}