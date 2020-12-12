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
    // this.setCollideWorldBounds(true); - has no effect, since
    // it turns out phaser 3 groups reset this value when you add the
    // game object to the group. (Apparently containers do the same?)
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
    // creates a graphics game object
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
    this.updateCoordsText();
    this.updateModelCoordsText();
    this.coordsText.visible = true;
    this.modelCoordsText.visible = true;
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
    this.healthBar.clear();
    this.coordsText.visible = false;
    this.modelCoordsText.visible = false;
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

  calculateNewCoords() {
    // if (this.x < 1000 && this.y > 1000 && this.y < 3000) {
    //   return { x: -128, y: 1500 };
    // }

    const randomPosition = randomNumber(1, 8);
    const distance = 64;

    let newX = this.x;
    let newY = this.y;

    switch (randomPosition) {
      case 1:
        newX += distance;
        break;
      case 2:
        newX -= distance;
        break;
      case 3:
        newY += distance;
        break;
      case 4:
        newY -= distance;
        break;
      case 5:
        newX += distance;
        newY += distance;
        break;
      case 6:
        newX += distance;
        newY -= distance;
        break;
      case 7:
        newX -= distance;
        newY += distance;
        break;
      case 8:
        newX -= distance;
        newY -= distance;
        break;
      default:
        break;
    }

    // console.log('New coords: ', newX, newY);

    return { x: newX, y: newY };
  }
}
