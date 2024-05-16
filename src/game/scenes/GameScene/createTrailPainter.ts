export function createTrailPainter(sprite: Phaser.GameObjects.Sprite) {
  const trailSprites: Phaser.GameObjects.Sprite[] = [];
  let framesSinceUpdate = 0;

  for (let i = 0; i < 3; i++) {
    const trailSprite = sprite.scene.add
      .sprite(0, 0, sprite.texture)
      // .setTint(0x800080)
      .setAlpha(0.1 + i * 0.1)
      .setScale(sprite.scaleX, sprite.scaleY)
      .setFlipX(sprite.flipX)
      .setVisible(true);

    trailSprites.unshift(trailSprite);
  }

  const onUpdate = () => {
    if (framesSinceUpdate < 1) {
      framesSinceUpdate++;
      return;
    }

    framesSinceUpdate = 0;

    for (let i = 0; i < trailSprites.length; i++) {
      const nextSprite = trailSprites[i + 1] as
        | Phaser.GameObjects.Sprite
        | undefined;
      const currentSprite = trailSprites[i];
      if (nextSprite) {
        currentSprite.setPosition(nextSprite.x, nextSprite.y);
        currentSprite.setRotation(nextSprite.rotation);
        currentSprite.setScale(nextSprite.scaleX, nextSprite.scaleY);
        currentSprite.setFlipX(nextSprite.flipX);
      } else {
        currentSprite.setPosition(sprite.x, sprite.y);
        currentSprite.setRotation(sprite.rotation);
        currentSprite.setScale(sprite.scaleX, sprite.scaleY);
        currentSprite.setFlipX(sprite.flipX);
      }
    }
  };
  sprite.on("destroy", () => trailSprites.forEach((s) => s.destroy()));

  return {
    onUpdate,
    destroy: () => trailSprites.forEach((s) => s.destroy()),
  };
}

