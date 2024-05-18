import { Game } from "./GameScene";
import { Enemy } from "./sprites/Enemy";
import { FastBoy } from "./sprites/FastBoy";
import { HugeBoy } from "./sprites/HugeBoy";
import { MagmaBoss } from "./sprites/MagmaBoss";
import { StrongBoy } from "./sprites/StrongBoy";

export function createEnemyManager(scene: Game) {
  const getSpawnCircle = () => {
    const spawnCircle = new Phaser.Geom.Circle(
      scene.player.x,
      scene.player.y,
      800
    );
    return spawnCircle;
  };

  const spawnEnemy = () => {
    if (scene.enemies.countActive() > 350) {
      queueEnemySpawn();
      return;
    }

    const spawnCircle = getSpawnCircle();
    const points = spawnCircle.getPoints(100);
    const randomPoint =
      points[Phaser.Math.RND.integerInRange(0, points.length - 1)];

    const seed = Phaser.Math.RND.realInRange(0, 100);
    let enemies: Enemy[] = [];

    if (seed > 99.9) {
      enemies.push(new MagmaBoss(scene, randomPoint.x, randomPoint.y));
    } else if (seed > 98) {
      enemies = enemies.concat(fastBoySwarm());
    } else if (seed > 80) {
      enemies.push(new StrongBoy(scene, randomPoint.x, randomPoint.y));
    } else if (seed > 77) {
      enemies.push(new HugeBoy(scene, randomPoint.x, randomPoint.y));
    } else {
      const count = Phaser.Math.RND.integerInRange(1, 10);
      for (let i = 0; i < count; i++) {
        const positionOffset = new Phaser.Math.Vector2(
          Phaser.Math.RND.integerInRange(-10, 10),
          Phaser.Math.RND.integerInRange(-10, 10)
        );
        enemies.push(
          new Enemy(
            scene,
            randomPoint.x + positionOffset.x,
            randomPoint.y + positionOffset.y
          )
        );
      }
    }

    enemies.forEach((e) => scene.enemies.add(e));
    queueEnemySpawn();
  };

  const fastBoySwarm = () => {
    const spawnCircle = getSpawnCircle();
    const points = spawnCircle.getPoints(10);
    const boys = [] as Enemy[];

    for (const point of points) {
      boys.push(new FastBoy(scene, point.x, point.y));
    }

    return boys;
  };

  const queueEnemySpawn = () => {
    scene.time.delayedCall(
      Math.max(1000 - scene.player.level * 10, 150),
      spawnEnemy,
      []
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const update = (_time: number, _delta: number) => {};

  return {
    queueEnemySpawn,
    update,
  };
}

