import Phaser from "phaser";
import { cardTexture, textureOr } from "../game/assets";
import { cardPalette } from "../game/cards";
import { cardById, applyRewardChoice } from "../game/rules";
import { completeCurrentNode, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import type { RunState } from "../game/types";
import {
  addButton,
  addPanel,
  addSmoke,
  addStatsBar,
  announce,
  createStageBackground,
  flashAt,
  reveal,
  textStyle,
  titleStyle,
  wrapText,
} from "../game/ui";

export class RewardScene extends Phaser.Scene {
  private run!: RunState;

  constructor() {
    super("RewardScene");
  }

  create(): void {
    const run = loadRun();
    if (!run) {
      this.scene.start("MenuScene");
      return;
    }
    if (!run.pendingReward) {
      this.scene.start("MapScene");
      return;
    }
    this.run = run;
    createStageBackground(this, "战利品");
    addStatsBar(this, run);
    addSmoke(this);
    this.drawReward();
    this.bindKeys();
  }

  private bindKeys(): void {
    for (let i = 1; i <= 3; i += 1) {
      this.input.keyboard?.on(`keydown-${i}`, () => this.choose(this.run.pendingReward?.cards[i - 1]));
    }
    this.input.keyboard?.on("keydown-ESC", () => this.choose());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  private drawReward(): void {
    const reward = this.run.pendingReward;
    if (!reward) return;
    const { width, height } = this.scale;
    const panel = addPanel(this, width / 2, height / 2 + 18, 920, 470, 0.94);
    reveal(this, panel, height / 2 + 42, height / 2 + 18);

    const title = this.add.text(width / 2, 176, "战斗已歇，择一张符纸入册", titleStyle(34)).setOrigin(0.5);
    reveal(this, title, 192, 176);
    const coins = this.add.text(width / 2, 222, `本次战利品：${reward.coins} 铜钱`, textStyle(20, COLORS.gold)).setOrigin(0.5);
    reveal(this, coins, 238, 222);

    reward.cards.forEach((cardId, index) => {
      this.drawCardChoice(cardId, width / 2 - 260 + index * 260, 402, index);
    });

    addButton(this, width / 2, 626, 200, 52, "跳过符纸", () => this.choose(), {
      aria: "跳过本次符纸奖励",
    });
  }

  private drawCardChoice(cardId: string, x: number, y: number, index: number): void {
    const card = cardById(cardId);
    const palette = cardPalette(card);
    const c = this.add.container(x, y).setSize(190, 260);
    const bg = this.add.rectangle(0, 0, 190, 260, palette.fill, 1).setStrokeStyle(4, palette.border);
    const art = this.add
      .image(0, -4, textureOr(this, cardTexture(card.id), "card-back"))
      .setDisplaySize(132, 176)
      .setAlpha(0.58);
    const veil = this.add.rectangle(0, 36, 154, 104, 0xf9e8c3, 0.6);
    const tag = this.add.rectangle(0, -124, 190, 18, palette.border, 0.95);
    const tagText = this.add.text(0, -124, `${palette.label} · ${palette.typeName}`, textStyle(13, 0xfaf0da, { fontStyle: "bold" })).setOrigin(0.5);
    const hotkey = this.add.text(-70, -102, `${index + 1}`, titleStyle(24)).setOrigin(0.5).setColor("#5b1612");
    const cost = this.add.text(70, -102, `${card.cost}`, titleStyle(24)).setOrigin(0.5).setColor(`#${palette.border.toString(16).padStart(6, "0")}`);
    const name = this.add.text(0, -62, card.name, titleStyle(25)).setOrigin(0.5).setColor("#43120f");
    const type = this.add.text(0, -22, palette.typeName, textStyle(15, 0x6d3a22)).setOrigin(0.5);
    const desc = this.add.text(0, 48, card.description, textStyle(17, 0x34120d, { align: "center", lineSpacing: 7 })).setOrigin(0.5);
    wrapText(desc, 150);
    c.add([bg, art, veil, tag, tagText, hotkey, cost, name, type, desc]);
    reveal(this, c, y + 34 + index * 10, y);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => this.tweens.add({ targets: c, y: y - 14, scale: 1.03, duration: 150, ease: "Sine.easeOut" }));
    c.on("pointerout", () => this.tweens.add({ targets: c, y, scale: 1, duration: 150, ease: "Sine.easeOut" }));
    c.on("pointerdown", () => this.tweens.add({ targets: c, scale: 0.98, duration: 80, ease: "Sine.easeOut" }));
    c.on("pointerup", () => this.choose(cardId));
  }

  private choose(cardId?: string): void {
    const message = applyRewardChoice(this.run, cardId);
    announce(message);
    flashAt(this, this.scale.width / 2, 410, cardId ? COLORS.good : COLORS.gold, 180);
    completeCurrentNode(this.run, message);
    saveRun(this.run);
    this.scene.start("MapScene");
  }
}
