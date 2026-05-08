import Phaser from "phaser";
import { BACKGROUNDS, nodeAssetTexture, textureOr } from "../game/assets";
import { currentNode, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import type { MapNode, RunState } from "../game/types";
import { addButton, addPanel, addSmoke, addStatsBar, announce, canAnimate, createStageBackground, pulse, reveal, textStyle, titleStyle } from "../game/ui";

export class MapScene extends Phaser.Scene {
  private run!: RunState;

  constructor() {
    super("MapScene");
  }

  create(): void {
    const run = loadRun();
    if (!run) {
      this.scene.start("MenuScene");
      return;
    }
    if (run.pendingReward) {
      this.scene.start("RewardScene");
      return;
    }
    this.run = run;
    createStageBackground(this, "跑局地图", BACKGROUNDS.village);
    addStatsBar(this, run);
    addSmoke(this);
    this.drawMap();

    addButton(this, 1120, 650, 160, 48, "回主菜单", () => {
      saveRun(this.run);
      this.scene.start("MenuScene");
    });

    this.input.keyboard?.on("keydown-ENTER", () => this.enterCurrentNode());
    this.input.keyboard?.on("keydown-SPACE", () => this.enterCurrentNode());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  private drawMap(): void {
    const { width } = this.scale;
    const active = currentNode(this.run);
    this.add.text(90, 132, this.run.lastMessage, textStyle(18, COLORS.muted)).setWordWrapWidth(760);

    const startX = 92;
    const gap = Math.min(84, (width - startX * 2) / Math.max(1, this.run.nodes.length - 1));
    const yBase = 370;
    const g = this.add.graphics();
    g.lineStyle(4, COLORS.goldDark, 0.75);
    for (let i = 0; i < this.run.nodes.length - 1; i += 1) {
      g.lineBetween(startX + i * gap, yBase + this.wave(i), startX + (i + 1) * gap, yBase + this.wave(i + 1));
    }

    this.run.nodes.forEach((node, index) => {
      const x = startX + index * gap;
      const y = yBase + this.wave(index);
      this.drawNode(node, x, y, node.id === active.id);
    });

    addPanel(this, width / 2, 585, 760, 86, 0.9);
    this.add.text(width / 2, 568, `当前：${active.label}`, titleStyle(24)).setOrigin(0.5);
    this.add.text(width / 2, 606, "点击发亮节点，或按 Enter / Space 进入。", textStyle(17, COLORS.muted)).setOrigin(0.5);
  }

  private drawNode(node: MapNode, x: number, y: number, active: boolean): void {
    const color = node.completed ? COLORS.good : active ? COLORS.primaryStrong : COLORS.surfaceStrong;
    const border = active ? COLORS.gold : COLORS.goldDark;
    const c = this.add.container(x, y).setSize(72, 72);
    const glow = this.add.circle(0, 0, 37, color, active ? 0.34 : 0.08).setStrokeStyle(2, border, active ? 0.95 : 0.42);
    const icon = this.add.image(0, 0, this.nodeTexture(node)).setDisplaySize(62, 62).setAlpha(active || node.completed ? 1 : 0.68);
    const label = this.add.text(0, 48, node.label, textStyle(13, active ? COLORS.text : COLORS.muted, { align: "center" })).setOrigin(0.5);
    label.setWordWrapWidth(86);
    c.add([glow, icon, label]);
    reveal(this, c, y + 12, y);
    if (active && !node.completed) {
      pulse(this, glow, 1.12, 980);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1.04, duration: 140, ease: "Sine.easeOut" });
      });
      c.on("pointerout", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1, duration: 140, ease: "Sine.easeOut" });
        else c.setScale(1);
      });
      c.on("pointerdown", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 0.96, duration: 80, ease: "Sine.easeOut" });
        else c.setScale(0.97);
      });
      c.on("pointerup", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1, duration: 120, ease: "Back.easeOut" });
        else c.setScale(1);
        this.enterCurrentNode();
      });
    }
  }

  private nodeTexture(node: MapNode): string {
    if (node.type === "combat") return textureOr(this, nodeAssetTexture("combat"), "node-combat");
    if (node.type === "elite") return textureOr(this, nodeAssetTexture("elite"), "node-elite");
    if (node.type === "event") return textureOr(this, nodeAssetTexture("event"), "node-event");
    if (node.type === "shop") return textureOr(this, nodeAssetTexture("shop"), "node-shop");
    return textureOr(this, nodeAssetTexture("boss"), "node-boss");
  }

  private wave(index: number): number {
    return Math.sin(index * 0.9) * 58;
  }

  private enterCurrentNode(): void {
    const node = currentNode(this.run);
    announce(`进入${node.label}`);
    if (node.type === "combat" || node.type === "elite" || node.type === "boss") this.scene.start("CombatScene", { enemyId: node.enemyId });
    if (node.type === "event") this.scene.start("EventScene", { eventId: node.eventId });
    if (node.type === "shop") this.scene.start("ShopScene");
  }
}
