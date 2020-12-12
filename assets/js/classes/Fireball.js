class Fireball extends Phaser.Physics.Arcade.Image {
  constructor(scene, playerContainer, key, id) {
    super(scene, playerContainer.x, playerContainer.y, key, 0);

    console.log('Fireball created: ', playerContainer);
    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable if another object collides with the fireball
    this.setImmovable(false);
    // add the fireball to our existing scene
    this.scene.add.existing(this);
    // scale the fireball
    this.setScale(0.5);

    this.targetDistance = 250;

    this.hasFlownFreelyUntilNow = true;
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
    this.hasFlownFreelyUntilNow = true;
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
  }

  getTarget(playerContainer) {
    const { x, y, currentDirection: dirr } = playerContainer;

    // console.log(x, y, dirr, this.angle, this.flipX);

    switch (dirr) {
      case Direction.LEFT:
        this.flipX = false;
        this.setAngle(0);
        return { x: x - this.targetDistance, y };
      case Direction.RIGHT:
        this.flipX = true;
        this.setAngle(0);
        return { x: x + this.targetDistance, y };
      case Direction.UP:
        this.flipX = false;
        this.setAngle(90);
        return { x, y: y - this.targetDistance };
      case Direction.DOWN:
        this.flipX = false;
        this.setAngle(-90);
        return { x, y: y + this.targetDistance };
      default:
        return { x: x - this.targetDistance, y };
    }
  }
}
