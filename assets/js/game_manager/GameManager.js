class GameManager {
  constructor(scene, mapData) {
    this.scene = scene;
    this.mapData = mapData;

    this.spawners = {};
    this.chests = {};
    this.monsters = {};
    this.players = {};

    this.playerLocations = [];
    this.chestLocations = {};
    this.monsterLocations = {};
  }

  setup() {
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
    this.spawnPlayer();
  }

  parseMapData() {
    this.mapData.forEach(layer => {
      if (layer.name === 'player_locations') {
        layer.objects.forEach(obj => {
          this.playerLocations.push([obj.x + obj.width / 2, obj.y - obj.height / 2]);
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach(obj => {
          if (this.chestLocations[obj.properties.spawner]) {
            this.chestLocations[obj.properties.spawner].push([
              obj.x + obj.width / 2,
              obj.y - obj.height / 2
            ]);
          } else {
            this.chestLocations[obj.properties.spawner] = [
              [obj.x + obj.width / 2, obj.y - obj.height / 2]
            ];
          }
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach(obj => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([
              obj.x + obj.width / 2,
              obj.y - obj.height / 2
            ]);
          } else {
            this.monsterLocations[obj.properties.spawner] = [
              [obj.x + obj.width / 2, obj.y - obj.height / 2]
            ];
          }
        });
      }
    });
  }

  setupEventListeners() {
    this.scene.events.on('pickupChest', (chestId, playerId) => {
      // update the spawner
      if (this.chests[chestId]) {
        const { gold } = this.chests[chestId];

        // updating the player's gold
        this.players[playerId].updateGold(gold);
        this.scene.events.emit('updateScore', this.players[playerId].gold);

        // removing the chest
        this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
        this.scene.events.emit('chestOpened', chestId);
      }
    });

    this.scene.events.on('monsterAttacked', (monsterId, playerId) => {
      // update the spawner
      if (this.monsters[monsterId]) {
        // subtract health from monster model
        this.monsters[monsterId].loseHealth();

        const { gold, attack } = this.monsters[monsterId];

        // check if monster died
        if (this.monsters[monsterId].health <= 0) {
          // updating the player's gold
          this.players[playerId].updateGold(gold);
          this.scene.events.emit('updateScore', this.players[playerId].gold);

          // removing the monster
          this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
          this.scene.events.emit('monsterDied', monsterId);

          // add bonus health to player
          this.players[playerId].updateHealth(2);
          this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);
        } else {
          // player was hit
          this.players[playerId].updateHealth(-attack);
          this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);

          // update the monster's health
          this.scene.events.emit('monsterHit', monsterId, this.monsters[monsterId].health);

          // check player's health
          if (this.players[playerId].health <= 0) {
            // update the player's gold
            this.players[playerId].updateGold(parseInt(-this.players[playerId].gold / 2, 10));
            this.scene.events.emit('updateScore', this.players[playerId].gold);

            // respawn the player
            this.players[playerId].respawn();
            this.scene.events.emit('respawnPlayer', this.players[playerId]);
          }
        }
      }
    });
  }

  setupSpawners() {
    //create chest spawners
    Object.keys(this.chestLocations).forEach(key => {
      const config = this.getConfig(SpawnerType.CHEST, `chest-${key}`);

      const spawner = new Spawner(
        config,
        this.chestLocations[key],
        this.addChest.bind(this),
        this.deleteChest.bind(this)
      );
      this.spawners[spawner.id] = spawner;
    });

    // create monster spawners
    Object.keys(this.monsterLocations).forEach(key => {
      const config = this.getConfig(SpawnerType.MONSTER, `monster-${key}`);

      const spawner = new Spawner(
        config,
        this.monsterLocations[key],
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this)
      );
      this.spawners[spawner.id] = spawner;
    });
  }

  getConfig(spawnerType, id) {
    return {
      spawnInterval: 3000,
      limit: 3,
      spawnerType: spawnerType,
      id: id
    };
  }

  spawnPlayer() {
    const player = new PlayerModel(this.playerLocations);
    this.players[player.id] = player;
    this.scene.events.emit('spawnPlayer', player);
  }

  addChest(id, chest) {
    this.chests[id] = chest;
    this.scene.events.emit('chestSpawned', chest);
  }

  deleteChest(id) {
    delete this.chests[id];
  }

  addMonster(id, monster) {
    this.monsters[id] = monster;
    this.scene.events.emit('monsterSpawned', monster);
  }

  deleteMonster(id) {
    delete this.monsters[id];
  }

  moveMonsters() {
    this.scene.events.emit('monsterMovement', this.monsters);
  }
}
