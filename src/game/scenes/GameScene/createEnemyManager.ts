import { Game } from "./GameScene";
import { Enemy } from "./sprites/Enemy";
import { FastBoy } from "./sprites/FastBoy";
import { HugeBoy } from "./sprites/HugeBoy";
import { MagmaBoss } from "./sprites/MagmaBoss";
import { StrongBoy } from "./sprites/StrongBoy";

export function createEnemyManager(scene: Game) {
  let stage = 1;
  let stage2Spawned = false;
  let stage3Spawned = false;

  scene.time.delayedCall(60 * 1000, () => (stage = 2));
  scene.time.delayedCall(60 * 5 * 1000, () => (stage = 3));

  const getSpawnCircle = () => {
    const spawnCircle = new Phaser.Geom.Circle(
      scene.player.x,
      scene.player.y,
      Math.max(800, scene.cameras.main.worldView.width)
    );
    return spawnCircle;
  };

  const spawnEnemy = () => {
    scene.enemies.getChildren().forEach((_e) => {
      const e = _e as Enemy;
      if (e.creature !== "devil") return;

      const distanceToPlayer = Phaser.Math.Distance.Between(
        e.x,
        e.y,
        scene.player.x,
        scene.player.y
      );

      if (distanceToPlayer > scene.cameras.main.worldView.width + 300) {
        e.destroy();
      }
    });

    if (scene.enemies.countActive() > 450) {
      queueEnemySpawn();
      return;
    }

    const spawnCircle = getSpawnCircle();
    const points = spawnCircle.getPoints(100);
    const randomPoint =
      points[Phaser.Math.RND.integerInRange(0, points.length - 1)];

    const seed = Phaser.Math.RND.realInRange(0, 100);
    let enemies: Enemy[] = [];

    const spawnBasicEnemies = (n = 10) => {
      const points = spawnCircle.getPoints(40);
      const randomPoints = points.sort(() => Math.random() - 0.5);
      const spawnPoints = randomPoints.slice(0, n);

      spawnPoints.forEach((point) => {
        enemies.push(new Enemy(scene, point.x, point.y));
      });
    };

    if (stage === 1) {
      spawnBasicEnemies(5);
    } else if (stage === 2) {
      if (!stage2Spawned) {
        enemies = enemies.concat(fastBoySwarm());
        stage2Spawned = true;
      }

      spawnBasicEnemies();

      if (seed > 98) {
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
    } else if (stage === 3) {
      if (!stage3Spawned) {
        enemies.push(new MagmaBoss(scene, randomPoint.x, randomPoint.y));
        stage3Spawned = true;
      }

      spawnBasicEnemies(30);
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

  const registerAdminSpawning = () => {
    if (!scene.input.keyboard) return;

    scene.input.keyboard.on("keydown", (k: KeyboardEvent) => {
      if (k.key !== "f") return;
      const p = scene.input.activePointer;
      if (!p) return;

      scene.enemies.add(new FastBoy(scene, p.worldX, p.worldY));
    });
  };
  registerAdminSpawning();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const update = (_time: number, _delta: number) => {};

  return {
    queueEnemySpawn,
    update,
  };
}

