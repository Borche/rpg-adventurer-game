class GameManager {
  constructor(scene, mapData) {
    this.scene = scene;
    this.mapData = mapData;

    this.spawners = {};
    this.chests = {};
    this.monsters = {};

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
    // console.log(this.playerLocations);
    // console.log(this.chestLocations);
    // console.log(this.monsterLocations);
  }

  setupEventListeners() {
    this.scene.events.on('pickupChest', chestId => {
      // update the spawner
      if (this.chests[chestId]) {
        this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
      }
    });

    this.scene.events.on('destroyEnemy', monsterId => {
      // update the spawner
      if (this.monsters[monsterId]) {
        this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
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
        this.deleteMonster.bind(this)
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
    const location = this.playerLocations[Math.floor(Math.random() * this.playerLocations.length)];
    this.scene.events.emit('spawnPlayer', location);
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
}
