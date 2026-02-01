import { COLORS } from "../constants";

export type PaddleSkinOptions = {
  player: "left" | "right";
  width: number;
  height: number;
  centerSize: number;
  playerColor: number;
};

export function createWoodenPaddleSkin(
  scene: Phaser.Scene,
  opts: PaddleSkinOptions,
): Phaser.GameObjects.Graphics {
  const { player, width: w, height: h, centerSize } = opts;

  const g = new Phaser.GameObjects.Graphics(scene);
  g.setName("paddle-wood-layer");

  const x0 = -w / 2;
  const y0 = -h / 2;

  g.lineStyle(3, 0x111111, 0.95);
  g.strokeRoundedRect(x0, y0, w, h, 6);

  g.fillStyle(0xb07a3a, 1);
  g.fillRoundedRect(x0, y0, w, h, 6);

  g.fillStyle(0xfff2d3, 0.18);
  g.fillRoundedRect(x0 + 1, y0 + 2, Math.max(2, w * 0.35), h - 4, 6);

  g.fillStyle(0x2a1608, 0.22);
  g.fillRoundedRect(
    x0 + w - Math.max(2, w * 0.28) - 1,
    y0 + 2,
    Math.max(2, w * 0.28),
    h - 4,
    6,
  );

  g.lineStyle(1, 0x5b2f12, 0.25);
  const grainXs = [x0 + w * 0.22, x0 + w * 0.38, x0 + w * 0.55, x0 + w * 0.72];
  for (const gx of grainXs) {
    g.beginPath();
    g.moveTo(gx, y0 + 6);
    g.lineTo(gx, y0 + h - 6);
    g.strokePath();
  }

  const playerColor = player === "left" ? COLORS.playerRed : COLORS.playerBlue;
  const centerH = h * centerSize;
  g.fillStyle(playerColor, 0.9);
  g.fillRoundedRect(x0 + 2, -centerH / 2, w - 4, centerH, 5);

  g.lineStyle(1, 0x000000, 0.35);
  g.strokeRoundedRect(x0 + 2, -centerH / 2, w - 4, centerH, 5);

  return g;
}
