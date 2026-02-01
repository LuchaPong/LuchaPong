export function setupBackground(scene: Phaser.Scene) {
  const { width, height } = scene.scale;

  const topPadding = height * 0.1;
  scene.physics.world.setBounds(
    0,
    topPadding * 1.25,
    width,
    height - topPadding * 2,
  );
  const worldBounds = scene.physics.world.bounds;

  const background = scene.add
    .image(width / 2, (height + topPadding) / 2, "background")
    .setDepth(-1000);

  background
    .setDisplaySize(worldBounds.width * 1.2, worldBounds.height * 1.21)
    .setY(worldBounds.centerY * 1.02);

  const camera = scene.cameras.main;
  camera.setZoom(0.85);
  camera.setScroll(0, scene.scale.height * 0.1);
  camera.setViewport(0, 0, scene.scale.width, scene.scale.height);

  return { worldBounds, background, camera };
}
