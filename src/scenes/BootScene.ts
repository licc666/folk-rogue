import Phaser from "phaser";
import { RUNTIME_ASSETS } from "../game/assets";
import { COLORS } from "../game/tokens";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    RUNTIME_ASSETS.forEach((asset) => {
      if (asset.type === "spritesheet") {
        this.load.spritesheet(asset.key, asset.url, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        });
        return;
      }
      this.load.image(asset.key, asset.url);
    });
  }

  create(): void {
    this.createGeneratedTextures();
    this.scene.start("MenuScene");
  }

  private createGeneratedTextures(): void {
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(COLORS.primary, 1).fillRect(0, 0, 96, 140);
    g.fillStyle(0xf3d87a, 1).fillRect(9, 10, 78, 120);
    g.lineStyle(4, COLORS.primary, 1);
    g.lineBetween(28, 30, 68, 30);
    g.lineBetween(48, 30, 40, 82);
    g.lineBetween(40, 82, 66, 100);
    g.generateTexture("card-back", 96, 140);

    if (!this.textures.exists("hero")) {
      g.clear();
      g.fillStyle(COLORS.text, 1).fillCircle(64, 42, 24);
      g.fillStyle(COLORS.surfaceStrong, 1).fillRect(36, 64, 56, 80);
      g.lineStyle(4, COLORS.primaryStrong, 1).lineBetween(32, 92, 96, 70);
      g.generateTexture("hero", 128, 160);
    }

    if (!this.textures.exists("youhun")) {
      g.clear();
      g.fillStyle(0xaec9cf, 0.75).fillEllipse(58, 70, 80, 118);
      g.fillStyle(COLORS.text, 0.95).fillCircle(58, 44, 18);
      g.generateTexture("youhun", 128, 150);
    }

    if (!this.textures.exists("ligui")) {
      g.clear();
      g.fillStyle(0x35505a, 0.9).fillEllipse(64, 76, 88, 120);
      g.fillStyle(0xf0ead6, 1).fillCircle(64, 42, 20);
      g.lineStyle(4, COLORS.primaryStrong, 1).lineBetween(42, 76, 86, 58);
      g.generateTexture("ligui", 128, 150);
    }

    if (!this.textures.exists("humei")) {
      g.clear();
      g.fillStyle(0xded1ba, 1).fillTriangle(34, 34, 64, 9, 94, 34);
      g.fillStyle(0xb64b38, 0.95).fillEllipse(64, 82, 82, 96);
      g.fillStyle(COLORS.text, 1).fillCircle(48, 54, 8).fillCircle(80, 54, 8);
      g.generateTexture("humei", 128, 150);
    }

    if (!this.textures.exists("shisha")) {
      g.clear();
      g.fillStyle(0x6d7770, 1).fillRect(38, 28, 56, 102);
      g.fillStyle(COLORS.text, 1).fillRect(42, 16, 48, 30);
      g.fillStyle(COLORS.primary, 1).fillRect(50, 28, 32, 10);
      g.generateTexture("shisha", 128, 150);
    }

    if (!this.textures.exists("shuigui")) {
      g.clear();
      g.fillStyle(0x4f7f83, 0.9).fillEllipse(64, 82, 76, 112);
      g.fillStyle(0x0c2023, 1).fillEllipse(64, 54, 54, 30);
      g.lineStyle(3, COLORS.spirit, 1).lineBetween(36, 112, 92, 112);
      g.generateTexture("shuigui", 128, 150);
    }

    if (!this.textures.exists("diaosi")) {
      g.clear();
      g.lineStyle(5, COLORS.text, 1).lineBetween(64, 8, 64, 42);
      g.fillStyle(0xe3dbc4, 0.95).fillEllipse(64, 82, 52, 106);
      g.fillStyle(COLORS.primary, 0.9).fillRect(45, 38, 38, 8);
      g.generateTexture("diaosi", 128, 150);
    }

    if (!this.textures.exists("xianghuozei")) {
      g.clear();
      g.fillStyle(COLORS.goldDark, 1).fillRect(38, 38, 52, 92);
      g.fillStyle(COLORS.gold, 1).fillCircle(42, 34, 18).fillCircle(86, 34, 18);
      g.fillStyle(COLORS.primary, 1).fillRect(34, 62, 60, 18);
      g.generateTexture("xianghuozei", 128, 150);
    }

    if (!this.textures.exists("taozhai")) {
      g.clear();
      g.fillStyle(COLORS.goldDark, 1).fillRect(42, 24, 58, 92);
      g.fillStyle(COLORS.primary, 1).fillRect(35, 8, 72, 24);
      g.lineStyle(3, COLORS.text, 1).strokeRect(45, 44, 52, 58);
      g.generateTexture("taozhai", 128, 150);
    }

    if (!this.textures.exists("yexian")) {
      g.clear();
      g.fillStyle(COLORS.goldDark, 1).fillRect(48, 18, 64, 116);
      g.fillStyle(0x272f26, 1).fillRect(58, 34, 44, 78);
      g.lineStyle(4, COLORS.primaryStrong, 1).strokeCircle(80, 70, 36);
      g.fillStyle(COLORS.gold, 1).fillCircle(80, 70, 10);
      g.generateTexture("yexian", 160, 160);
    }

    if (!this.textures.exists("shiwang")) {
      g.clear();
      g.fillStyle(0x59645f, 1).fillRect(46, 30, 68, 110);
      g.fillStyle(0xcfc5a8, 1).fillRect(55, 14, 50, 30);
      g.fillStyle(COLORS.primaryStrong, 1).fillRect(68, 36, 24, 16);
      g.lineStyle(5, COLORS.gold, 1).lineBetween(42, 92, 118, 58);
      g.generateTexture("shiwang", 160, 160);
    }

    if (!this.textures.exists("taisui")) {
      g.clear();
      g.fillStyle(COLORS.danger, 1).fillEllipse(80, 74, 116, 130);
      g.fillStyle(COLORS.gold, 1).fillRect(42, 18, 76, 104);
      g.lineStyle(4, COLORS.primaryStrong, 1).strokeCircle(80, 74, 48);
      g.lineStyle(3, COLORS.text, 0.9);
      g.lineBetween(80, 26, 80, 122);
      g.lineBetween(48, 74, 112, 74);
      g.generateTexture("taisui", 160, 160);
    }

    this.createNodeTextures(g);
    this.createSceneIllustrations(g);

    g.clear();
    g.fillStyle(COLORS.gold, 1).fillRoundedRect(0, 0, 72, 72, 8);
    g.fillStyle(COLORS.surfaceStrong, 1).fillRoundedRect(8, 8, 56, 56, 6);
    g.generateTexture("icon-token", 72, 72);

    g.destroy();
  }

  private createNodeTextures(g: Phaser.GameObjects.Graphics): void {
    const nodeSize = 96;
    const makeBase = (fill: number, stroke: number) => {
      g.clear();
      g.fillStyle(fill, 1).fillCircle(48, 48, 39);
      g.lineStyle(5, stroke, 1).strokeCircle(48, 48, 39);
    };

    if (!this.textures.exists("node-combat")) {
      makeBase(COLORS.primary, COLORS.gold);
      g.fillStyle(0xf2d26b, 1).fillRect(35, 25, 26, 46);
      g.lineStyle(4, COLORS.text, 1).lineBetween(31, 37, 67, 37).lineBetween(48, 37, 41, 65);
      g.generateTexture("node-combat", nodeSize, nodeSize);
    }

    if (!this.textures.exists("node-elite")) {
      makeBase(0x4b2426, COLORS.primaryStrong);
      g.fillStyle(COLORS.gold, 1).fillRect(30, 26, 36, 52);
      g.lineStyle(3, COLORS.primaryStrong, 1).strokeCircle(48, 52, 24);
      g.generateTexture("node-elite", nodeSize, nodeSize);
    }

    if (!this.textures.exists("node-event")) {
      makeBase(COLORS.goldDark, COLORS.gold);
      g.fillStyle(0xf0d58a, 1).fillRect(34, 28, 28, 42);
      g.fillStyle(COLORS.primaryStrong, 1).fillCircle(48, 28, 16);
      g.generateTexture("node-event", nodeSize, nodeSize);
    }

    if (!this.textures.exists("node-shop")) {
      makeBase(COLORS.surfaceStrong, COLORS.gold);
      g.fillStyle(COLORS.primary, 1).fillTriangle(28, 54, 48, 30, 68, 54);
      g.fillStyle(COLORS.gold, 1).fillRect(31, 54, 34, 18);
      g.generateTexture("node-shop", nodeSize, nodeSize);
    }

    if (!this.textures.exists("node-boss")) {
      makeBase(COLORS.danger, COLORS.primaryStrong);
      g.fillStyle(COLORS.gold, 1).fillRect(31, 22, 34, 56);
      g.lineStyle(3, COLORS.text, 1).strokeRect(37, 30, 22, 34);
      g.generateTexture("node-boss", nodeSize, nodeSize);
    }

    if (!this.textures.exists("shopkeeper")) {
      g.clear();
      g.fillStyle(0xd8cbb0, 1).fillEllipse(72, 60, 70, 94);
      g.fillStyle(COLORS.surfaceStrong, 1).fillRect(36, 88, 72, 82);
      g.fillStyle(COLORS.primary, 1).fillRect(24, 56, 96, 22);
      g.fillStyle(COLORS.text, 1).fillCircle(58, 60, 4).fillCircle(86, 60, 4);
      g.lineStyle(4, COLORS.gold, 1).strokeRect(34, 84, 76, 84);
      g.generateTexture("shopkeeper", 144, 184);
    }
  }

  private createSceneIllustrations(g: Phaser.GameObjects.Graphics): void {
    const makeScroll = (key: string, accent: number, draw: () => void) => {
      g.clear();
      g.fillStyle(0x1c2924, 1).fillRoundedRect(0, 0, 300, 190, 10);
      g.fillStyle(0xefe0bb, 0.94).fillRoundedRect(24, 20, 252, 150, 8);
      g.lineStyle(4, accent, 1).strokeRoundedRect(24, 20, 252, 150, 8);
      draw();
      g.generateTexture(key, 300, 190);
    };

    if (!this.textures.exists("event-qiantong")) makeScroll("event-qiantong", COLORS.gold, () => {
      g.fillStyle(COLORS.goldDark, 1).fillRect(128, 52, 44, 82);
      g.lineStyle(3, COLORS.primary, 1).strokeRect(124, 48, 52, 90);
      g.fillStyle(COLORS.primaryStrong, 1).fillRect(88, 44, 16, 72).fillRect(196, 40, 16, 76);
    });
    if (!this.textures.exists("event-debt")) makeScroll("event-debt", COLORS.primaryStrong, () => {
      g.fillStyle(COLORS.goldDark, 1).fillRect(82, 62, 136, 74);
      g.lineStyle(3, COLORS.text, 1).lineBetween(104, 82, 196, 82).lineBetween(104, 104, 180, 104);
    });
    if (!this.textures.exists("event-huanyuan")) makeScroll("event-huanyuan", COLORS.gold, () => {
      for (let i = 0; i < 5; i += 1) g.fillStyle(COLORS.goldDark, 1).fillRect(70 + i * 36, 54 + (i % 2) * 12, 24, 54);
      g.lineStyle(2, COLORS.primary, 1).lineBetween(64, 48, 234, 48);
    });
    if (!this.textures.exists("event-shrine")) makeScroll("event-shrine", COLORS.primaryStrong, () => {
      g.fillStyle(COLORS.surfaceStrong, 1).fillRect(92, 46, 116, 90);
      g.fillStyle(COLORS.gold, 1).fillRect(118, 66, 64, 48);
      g.fillStyle(COLORS.primaryStrong, 1).fillCircle(150, 90, 14);
    });
    if (!this.textures.exists("event-lantern")) makeScroll("event-lantern", COLORS.primaryStrong, () => {
      g.fillStyle(COLORS.primaryStrong, 1).fillEllipse(150, 84, 70, 88);
      g.fillStyle(COLORS.gold, 1).fillEllipse(150, 86, 38, 52);
      g.lineStyle(3, COLORS.goldDark, 1).lineBetween(150, 36, 150, 18);
    });
    if (!this.textures.exists("event-grave")) makeScroll("event-grave", COLORS.good, () => {
      g.fillStyle(0x39423a, 1).fillRect(72, 92, 156, 28);
      g.fillStyle(COLORS.goldDark, 1).fillRect(128, 58, 44, 72);
      g.lineStyle(3, COLORS.spirit, 1).lineBetween(134, 68, 162, 92).lineBetween(162, 92, 142, 112);
    });
    if (!this.textures.exists("event-incense")) makeScroll("event-incense", COLORS.gold, () => {
      g.fillStyle(COLORS.surfaceStrong, 1).fillRect(78, 70, 144, 54);
      g.fillStyle(COLORS.primary, 1).fillRect(95, 50, 110, 24);
      g.lineStyle(3, COLORS.gold, 1).lineBetween(120, 122, 120, 46).lineBetween(150, 122, 150, 42).lineBetween(180, 122, 180, 46);
    });
    if (!this.textures.exists("event-bailiff")) makeScroll("event-bailiff", COLORS.spirit, () => {
      g.fillStyle(0x101b18, 1).fillEllipse(150, 72, 116, 42);
      g.fillStyle(COLORS.text, 1).fillRect(138, 70, 24, 64);
      g.lineStyle(3, COLORS.spirit, 1).lineBetween(150, 34, 150, 138);
    });
    if (!this.textures.exists("event-fox")) makeScroll("event-fox", COLORS.primaryStrong, () => {
      g.fillStyle(0xded1ba, 1).fillTriangle(108, 62, 132, 34, 154, 62).fillTriangle(146, 62, 168, 34, 192, 62);
      g.fillStyle(COLORS.primaryStrong, 1).fillEllipse(150, 94, 84, 70);
    });
    if (!this.textures.exists("event-boat")) makeScroll("event-boat", COLORS.spirit, () => {
      g.fillStyle(COLORS.spirit, 0.75).fillRect(72, 118, 156, 8);
      g.fillStyle(COLORS.text, 1).fillTriangle(94, 102, 150, 132, 210, 102);
      g.fillStyle(COLORS.gold, 1).fillRect(146, 66, 8, 44);
      g.fillStyle(COLORS.primaryStrong, 1).fillCircle(150, 62, 12);
    });

    g.clear();
    g.fillStyle(COLORS.primaryStrong, 1).fillCircle(8, 8, 8);
    g.generateTexture("particle-fuhuo", 16, 16);
    g.clear();
    g.fillStyle(COLORS.gold, 1).fillRect(4, 1, 8, 14);
    g.generateTexture("particle-paper", 16, 16);
    g.clear();
    g.fillStyle(COLORS.spirit, 1).fillCircle(6, 6, 6);
    g.generateTexture("particle-spirit", 12, 12);
  }
}
