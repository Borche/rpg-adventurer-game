class Monster extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key, frame, id, health, maxHealth) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.id = id;
    this.health = health;
    this.maxHealth = maxHealth;
    this.modelX = x;
    this.modelY = y;

    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable if another object collides with the monster
    this.setImmovable(false);
    // scale the monster
    this.setScale(2);
    // collide with world bounds
    this.setCollideWorldBounds(true);
    // add the monster to the existing scene
    this.scene.add.existing(this);
    // update the origin
    this.setOrigin(0);
    this.createHealthBar();
    if (DEBUG) {
      this.createCoordsText();
      this.createModelCoordsText();
    }
  }

  createCoordsText() {
    this.coordsText = this.scene.add.text(0, 0, `(${this.x},${this.y})`, {
      fontSize: '20px',
      fill: '#fff'
    });
    this.updateCoordsText();
  }

  updateCoordsText() {
    this.coordsText.setText(`(${Math.round(this.x)},${Math.round(this.y)})`);
    this.coordsText.x = this.x - 32;
    this.coordsText.y = this.y - 26;
  }

  createModelCoordsText() {
    this.modelCoordsText = this.scene.add.text(0, 0, `(${this.modelX},${this.modelY})`, {
      fontSize: '18px',
      fill: '#abcdef'
    });
    this.updateModelCoordsText();
  }

  updateModelCoordsText() {
    this.modelCoordsText.setText(`${Math.round(this.modelX)},${Math.round(this.modelY)})`);
    this.modelCoordsText.x = this.x - 32;
    this.modelCoordsText.y = this.y - 40;
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    // clear all graphics already drawn
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffffff, 1);
    this.healthBar.fillRect(this.x, this.y - 8, 64, 5);
    this.healthBar.fillGradientStyle(0xff0000, 0xffffff, 4);
    this.healthBar.fillRect(this.x, this.y - 8, 64 * (this.health / this.maxHealth), 5);
  }

  updateHealth(health) {
    this.health = health;
    this.updateHealthBar();
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
    this.updateHealthBar();
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
    this.healthBar.clear();
  }

  update() {
    this.updateHealthBar();
    if (DEBUG) {
      this.updateCoordsText();
      this.updateModelCoordsText();
    }
  }

  updateModelCoords(x, y) {
    this.modelX = x;
    this.modelY = y;
  }
}
