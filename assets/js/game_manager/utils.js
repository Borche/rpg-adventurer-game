const SpawnerType = {
  MONSTER: 'MONSTER',
  CHEST: 'CHEST'
};

function randomNumber(min, max) {
  // return Math.floor(Math.random() * max) + min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDouble(min, max) {
  return Math.floor(Math.random() * max) + min;
}
