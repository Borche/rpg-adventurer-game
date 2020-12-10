class MonsterModel {
  constructor(x, y, gold, spawnerId, frame, health, attack) {
    this.id = `${spawnerId}-${uuid.v4()}`;
    this.spawnerId = spawnerId;
    this.x = x;
    this.y = y;
    this.gold = gold;
    this.frame = frame;
    this.health = health;
    this.maxHealth = health;
    this.attack = attack;
  }
}
