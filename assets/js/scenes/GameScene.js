class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('Ui');
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();

    this.createGameManager();

    console.log(`World: `, this.physics.world);
  }

  update() {
    if (this.playerContainer) this.playerContainer.update(this.cursors);
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 0.5 });
    this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.2 });
    this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 0.2 });
    this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 0.2 });
    this.monsterDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 0.2 });
  }

  createPlayer(playerObject) {
    this.playerContainer = new PlayerContainer(
      this,
      64 + 32, // playerObject.x * 2,
      this.physics.world.bounds.centerY - 64 * 2 - 32, // playerObject.y * 2,
      'characters',
      0,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio
    );
  }

  createGroups() {
    // create a chest group
    this.chests = this.physics.add.group();
    this.monsters = this.physics.add.group({ collideWorldBounds: true });

    // runChildUpdate on groups is default set to false.
    // setting it to true makes Phaser run the update() methods
    // on the objects in the group, if they have one
    this.monsters.runChildUpdate = true;
  }

  spawnChest(chestModel) {
    let chest = this.chests.getFirstDead();

    if (!chest) {
      chest = new Chest(
        this,
        chestModel.x * 2,
        chestModel.y * 2,
        'items',
        0,
        chestModel.gold,
        chestModel.id
      );
      // add chest to chests group
      this.chests.add(chest);
    } else {
      chest.coins = chestModel.gold;
      chest.id = chestModel.id;
      chest.setPosition(chestModel.x * 2, chestModel.y * 2);
      chest.makeActive();
    }
  }

  spawnMonster(monsterModel) {
    let monster = this.monsters.getFirstDead();

    if (!monster) {
      monster = new Monster(
        this,
        monsterModel.x,
        monsterModel.y,
        'monsters',
        monsterModel.frame,
        monsterModel.id,
        monsterModel.health,
        monsterModel.maxHealth
      );
      // add monster to monsters group
      this.monsters.add(monster);
      // monster.setCollideWorldBounds(true);
    } else {
      monster.id = monsterModel.id;
      monster.health = monsterModel.health;
      monster.maxHealth = monsterModel.maxHealth;
      monster.setTexture('monsters', monsterModel.frame);
      monster.setPosition(monsterModel.x, monsterModel.y);
      monster.makeActive();
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addCollisions() {
    // check for collisions between player and the tiled blocked layer
    this.physics.add.collider(this.playerContainer, this.map.blockedLayer);
    // check for overlaps between player and chest game objects
    this.physics.add.overlap(this.playerContainer, this.chests, this.collectChest, null, this);
    // check for collisions between monster group and the tiled blocked layer
    this.physics.add.collider(this.monsters, this.map.blockedLayer);
    // check for overlaps between player and monster game objects
    this.physics.add.overlap(
      this.playerContainer.weapon,
      this.monsters,
      this.enemyOverlap,
      null,
      this
    );
  }

  enemyOverlap(weapon, enemy) {
    if (this.playerContainer.isAttacking && !this.playerContainer.swordHit) {
      this.playerContainer.swordHit = true;
      this.events.emit('monsterAttacked', enemy.id, this.playerContainer.id);
    }
  }

  collectChest(player, chest) {
    // play gold pickup sound
    this.goldPickupAudio.play();
    this.events.emit('pickupChest', chest.id, player.id);
  }

  createMap() {
    // create the tile map
    this.map = new Map(this, 'map', 'background', 'background', 'blocked');
  }

  createGameManager() {
    this.events.on('spawnPlayer', playerModel => {
      this.createPlayer(playerModel);
      this.addCollisions();
    });

    this.events.on('chestSpawned', chestModel => {
      this.spawnChest(chestModel);
    });

    this.events.on('chestOpened', chestModelId => {
      this.chests.getChildren().forEach(chest => {
        if (chest.id === chestModelId) {
          chest.makeInactive();
        }
      });
    });

    this.events.on('monsterSpawned', monsterModel => {
      this.spawnMonster(monsterModel);
    });

    this.events.on('monsterHit', (monsterModelId, health) => {
      this.monsters.getChildren().forEach(monster => {
        if (monster.id === monsterModelId) {
          monster.updateHealth(health);
        }
      });
    });

    this.events.on('monsterDied', monsterId => {
      this.monsters.getChildren().forEach(monster => {
        if (monster.id === monsterId) {
          this.monsterDeathAudio.play();
          monster.makeInactive();
        }
      });
    });

    this.events.on('monsterMovement', monsterModels => {
      this.monsters.getChildren().forEach(monster => {
        let newCoords = monster.calculateNewCoords();
        this.physics.moveToObject(monster, newCoords, 40); // , 1000);

        if (monsterModels[monster.id]) {
          // for now at least, also update monsterModel in case we need
          // the coords there for something...
          monsterModels[monster.id].x = newCoords.x;
          monsterModels[monster.id].y = newCoords.y;
          monster.updateModelCoords(monsterModels[monster.id].x, monsterModels[monster.id].y);
        }
      });
    });

    this.events.on('updatePlayerHealth', (playerId, health) => {
      if (health < this.playerContainer.health) {
        this.playerDamageAudio.play();
      }
      this.playerContainer.updateHealth(health);
    });

    this.events.on('respawnPlayer', playerObject => {
      this.playerDeathAudio.play();
      this.playerContainer.respawn(playerObject);
    });

    this.gameManager = new GameManager(this, this.map.map.objects);
    this.gameManager.setup();
  }
}
