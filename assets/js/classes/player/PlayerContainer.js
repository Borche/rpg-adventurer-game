class PlayerContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, frame) {
    super(scene, x, y);
    this.scene = scene; // the scene this container will be added to
    this.velocity = 160; // the velocity when moving our player

    // set a size on the container
    this.setSize(64, 64);
    // enable physics
    this.scene.physics.world.enable(this);
    // collide with world bounds
    this.body.setCollideWorldBounds(true);
    // add the player container to our existing scene
    this.scene.add.existing(this);
    // have the camera follow the player
    this.scene.cameras.main.startFollow(this);

    // create the player
    this.player = new Player(this.scene, 0, 0, key, frame);
    this.add(this.player);
  }

  update(cursors) {
    this.body.setVelocity(0);

    if (cursors.left.isDown) {
      this.body.setVelocityX(-this.velocity);
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(this.velocity);
    }

    if (cursors.up.isDown) {
      this.body.setVelocityY(-this.velocity);
    } else if (cursors.down.isDown) {
      this.body.setVelocityY(this.velocity);
    }
  }
}
