import Phaser from "phaser";
import { EVENT_BACKGROUNDS, fxTexture, textureOr } from "../game/assets";
import { EVENTS } from "../game/data";
import { clampRun, completeCurrentNode, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import type { EventChoice, EventConfig, RunState } from "../game/types";
import { addButton, addPanel, addSmoke, addStatsBar, createStageBackground, flashAt, particleBurst, reveal, textStyle, titleStyle, wrapText } from "../game/ui";

export class EventScene extends Phaser.Scene {
  private run!: RunState;
  private eventConfig!: EventConfig;

  constructor() {
    super("EventScene");
  }

  create(data: { eventId?: string }): void {
    const run = loadRun();
    if (!run) {
      this.scene.start("MenuScene");
      return;
    }
    this.run = run;
    this.eventConfig = EVENTS.find((event) => event.id === data.eventId) ?? EVENTS[0];
    createStageBackground(this, "事件", EVENT_BACKGROUNDS[this.eventConfig.id]);
    addStatsBar(this, run);
    addSmoke(this);
    this.drawEvent();
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("MapScene"));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  private drawEvent(): void {
    const { width, height } = this.scale;
    const panel = addPanel(this, width / 2, height / 2 + 20, 820, 500, 0.94);
    reveal(this, panel, height / 2 + 44, height / 2 + 20);
    const title = this.add.text(width / 2, 164, this.eventConfig.title, titleStyle(34)).setOrigin(0.5);
    reveal(this, title, 180, 164);
    const art = this.add.image(width / 2, 278, this.eventConfig.visualKey).setDisplaySize(336, 205);
    reveal(this, art, 296, 278);
    const body = this.add.text(width / 2, 402, this.eventConfig.body, textStyle(20, COLORS.text, { align: "center" })).setOrigin(0.5);
    wrapText(body, 650);
    reveal(this, body, 422, 402);

    this.eventConfig.choices.forEach((choice, index) => {
      const y = 500 + index * 72;
      addButton(this, width / 2, y, 620, 62, `${choice.label}  ·  ${choice.description}`, () => this.choose(choice), {
        primary: index === 0,
      });
    });
  }

  private choose(choice: EventChoice): void {
    flashAt(this, this.scale.width / 2, 410, COLORS.gold, 160);
    const paperFx = textureOr(this, fxTexture("paper-money"), "particle-paper");
    particleBurst(this, this.scale.width / 2, 410, paperFx, {
      count: 12,
      color: COLORS.gold,
      spread: 96,
      rise: 80,
      ...(this.textures.exists(fxTexture("paper-money")) ? { frameStart: 0, frameEnd: 7 } : {}),
    });
    const effects = choice.effects;
    this.run.stats.life += effects.life ?? 0;
    this.run.stats.maxLife += effects.maxLife ?? 0;
    this.run.stats.divine += effects.divine ?? 0;
    this.run.stats.longevity += effects.longevity ?? 0;
    this.run.stats.virtue += effects.virtue ?? 0;
    this.run.stats.luck += effects.luck ?? 0;
    this.run.coins += effects.coins ?? 0;
    if (effects.cardId) this.run.deck.push(effects.cardId);
    if (effects.itemId) this.run.items.push(effects.itemId);
    clampRun(this.run);
    completeCurrentNode(this.run, `${this.eventConfig.title}：${choice.label}`);
    saveRun(this.run);
    this.scene.start("MapScene");
  }
}
