import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

function App() {
  // The sprite can only be moved in the MainMenu Scene
  const [_canMoveSprite, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />s
    </div>
  );
}

export default App;
