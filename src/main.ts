import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { MapScene } from "./scenes/MapScene";
import { CombatScene } from "./scenes/CombatScene";
import { EventScene } from "./scenes/EventScene";
import { ShopScene } from "./scenes/ShopScene";
import { RewardScene } from "./scenes/RewardScene";
import { ResultScene } from "./scenes/ResultScene";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#091513",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  dom: {
    createContainer: true,
  },
  scene: [
    BootScene,
    MenuScene,
    MapScene,
    CombatScene,
    EventScene,
    ShopScene,
    RewardScene,
    ResultScene,
  ],
  callbacks: {
    postBoot: (game) => {
      game.registry.set("reducedMotion", prefersReducedMotion);
    },
  },
};

new Phaser.Game(config);
