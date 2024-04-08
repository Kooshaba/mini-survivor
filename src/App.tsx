import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { EventBus } from "./game/EventBus";
import { Upgrade } from "./game/scenes/GameScene/weapons/Weapon";

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  const [currentScene, setCurrentScene] = useState<Phaser.Scene | null>(null);

  // Event emitted from the PhaserGame component
  const onSceneChange = (scene: Phaser.Scene) => {
    setCurrentScene(scene);
  };

  const [upgradeChoices, setUpgradeChoices] = useState<Upgrade[]>([]);
  useEffect(() => {
    const onPlayerLevelUp = (data: { upgrades: Upgrade[] }) => {
      setUpgradeChoices(data.upgrades);
    };
    EventBus.on("player-level-up", onPlayerLevelUp);

    return () => {
      EventBus.off("player-level-up", onPlayerLevelUp);
    };
  }, [currentScene]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
      id="app"
    >
      <PhaserGame ref={phaserRef} currentActiveScene={onSceneChange} />

      <div
        style={{
          position: "absolute",
          top: `50%`,
          left: `50%`,
          transform: `translate(-50%, -50%)`,
        }}
      >
        {currentScene?.scene.key === "MainMenu" && (
          <div>
            <button
              onClick={() => {
                phaserRef.current?.scene?.scene.start("Game");
              }}
            >
              Start!
            </button>
          </div>
        )}

        {upgradeChoices.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "10px",
              color: "black",
            }}
          >
            <h1>Choose an upgrade</h1>
            <ul>
              {upgradeChoices.map((upgrade, index) => (
                <li key={index}>
                  <h2>{upgrade.name}</h2>
                  <p>{upgrade.description}</p>
                  <button
                    onClick={() => {
                      upgrade.execute();
                      phaserRef.current?.scene?.scene.resume();
                      setUpgradeChoices([]);
                    }}
                  >
                    Choose
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
