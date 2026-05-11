import Phaser from "phaser";
import { ENEMY_BACKGROUNDS, fxTexture, godTexture, omenTextTexture, omenTexture, textureOr } from "../game/assets";
import { cardPalette } from "../game/cards";
import { cardById, createCombat, createVictoryReward, currentIntent, enemyAct, enemyById, godById, playCard } from "../game/rules";
import { clampRun, currentNode, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import type { CardPlayResult, CombatState, EnemyIntent, RunState } from "../game/types";
import {
  addButton,
  addPanel,
  addSmoke,
  addStatsBar,
  announce,
  canAnimate,
  createStageBackground,
  flashAt,
  float,
  impactText,
  particleBurst,
  pulse,
  reveal,
  shake,
  textStyle,
  titleStyle,
  wrapText,
} from "../game/ui";

export class CombatScene extends Phaser.Scene {
  private run!: RunState;
  private combat!: CombatState;
  private enemyId = "youhun";
  private busy = false;
  private heroSprite?: Phaser.GameObjects.Image;
  private enemySprite?: Phaser.GameObjects.Image;
  private hasDrawnOnce = false;

  constructor() {
    super("CombatScene");
  }

  create(data: { enemyId?: string }): void {
    const run = loadRun();
    if (!run) {
      this.scene.start("MenuScene");
      return;
    }
    this.run = run;
    this.enemyId = data.enemyId ?? "youhun";
    this.combat = createCombat(run, this.enemyId);
    this.draw();
    this.bindKeys();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  private bindKeys(): void {
    this.input.keyboard?.on("keydown-ESC", () => {
      saveRun(this.run);
      this.scene.start("MapScene");
    });
    for (let i = 1; i <= 5; i += 1) {
      this.input.keyboard?.on(`keydown-${i}`, () => this.tryPlay(i - 1));
    }
    this.input.keyboard?.on("keydown-SPACE", () => this.endTurn());
    this.input.keyboard?.on("keydown-ENTER", () => this.endTurn());
  }

  private draw(): void {
    this.registry.set("suppressReveal", this.hasDrawnOnce);
    this.children.list
      .filter((child) => !child.getData?.("persistOnRedraw"))
      .forEach((child) => child.destroy());
    createStageBackground(this, undefined, ENEMY_BACKGROUNDS[this.enemyId]);
    addStatsBar(this, this.run);
    addSmoke(this);
    this.drawArena();
    this.drawCombatHud();
    this.drawHand();
    this.drawLog();
    this.registry.set("suppressReveal", false);
    this.hasDrawnOnce = true;
  }

  private drawArena(): void {
    const { width, height } = this.scale;
    const enemy = enemyById(this.combat.enemy.id);
    addPanel(this, width / 2, 356, 1040, 328, 0.5);

    this.add.ellipse(330, 462, 210, 45, COLORS.black, 0.45);
    this.heroSprite = this.add.image(330, 360, textureOr(this, "hero-combat", "hero")).setDisplaySize(148, 176);
    float(this, this.heroSprite, 7, 1700);
    this.add.text(330, 502, "民间法师", titleStyle(20)).setOrigin(0.5);
    this.add.text(330, 530, `护身 ${this.combat.block}`, textStyle(17, COLORS.muted)).setOrigin(0.5);

    const texture = enemy.id;
    const isBoss = enemy.tier === "boss";
    const isElite = enemy.tier === "elite";
    this.add.ellipse(940, 462, 238, 52, COLORS.black, 0.5);
    this.enemySprite = this.add.image(940, isBoss ? 348 : isElite ? 356 : 364, texture).setDisplaySize(isBoss ? 210 : isElite ? 178 : 144, isBoss ? 210 : isElite ? 178 : 168);
    float(this, this.enemySprite, isBoss ? 5 : 9, isBoss ? 2200 : 1550);
    if (isBoss) pulse(this, this.enemySprite, 1.035, 2100);
    const tierLabel = isBoss ? "最终 Boss" : isElite ? "精英怪" : "志怪";
    this.add.text(940, 502, `${enemy.name} · ${tierLabel}`, titleStyle(20)).setOrigin(0.5);
    this.drawHealthBar(805, 526, 270, 18, this.combat.enemy.life, this.combat.enemy.maxLife, COLORS.danger);
    this.add.text(940, 554, `护身 ${this.combat.enemy.block} · 意图 ${this.intentLabel(currentIntent(enemy, this.combat))}`, textStyle(16, COLORS.muted)).setOrigin(0.5);
    this.drawActiveGod(610, 392);

    const omenTextKey = omenTextTexture(this.combat.omen.id);
    const omen = this.textures.exists(omenTextKey)
      ? this.add.image(width / 2 + 20, 126, omenTextKey).setDisplaySize(108, 54)
      : this.add.text(width / 2, 126, `签运：${this.combat.omen.name}`, titleStyle(29)).setOrigin(0.5);
    if (omen instanceof Phaser.GameObjects.Text) omen.setColor(`#${this.omenColor().toString(16).padStart(6, "0")}`);
    reveal(this, omen, 118, 126);
    pulse(this, omen, 1.04, 1100);
    if (!(omen instanceof Phaser.GameObjects.Text)) {
      const label = this.add.text(width / 2 - 78, 126, "签运", titleStyle(20)).setOrigin(0.5);
      label.setColor(`#${this.omenColor().toString(16).padStart(6, "0")}`);
      reveal(this, label, 118, 126);
    }
    const omenIconKey = omenTexture(this.combat.omen.id);
    if (this.textures.exists(omenIconKey)) {
      const omenIcon = this.add.image(width / 2 - 126, 126, omenIconKey).setDisplaySize(48, 48).setAlpha(0.92);
      reveal(this, omenIcon, 118, 126);
      pulse(this, omenIcon, 1.045, 1200);
    }
    const desc = this.add.text(width / 2, 160, `${this.combat.omen.description} 倍率 x${this.combat.omen.multiplier}`, textStyle(16, this.omenColor())).setOrigin(0.5);
    reveal(this, desc, 168, 160);
  }

  private drawCombatHud(): void {
    const { width } = this.scale;
    addPanel(this, width / 2, 640, 1070, 132, 0.88);
    this.add.text(118, 606, `行动点 ${this.combat.actionPoints}`, titleStyle(24));
    this.add.text(118, 638, `牌堆 ${this.combat.drawPile.length} · 弃牌 ${this.combat.discardPile.length}`, textStyle(15, COLORS.muted));
    this.add.text(118, 664, `回合 ${this.combat.turn}`, textStyle(15, COLORS.muted));
    addButton(this, 1070, 640, 148, 52, "结束回合", () => this.endTurn(), { primary: true });
  }

  private drawHand(): void {
    const startX = 286;
    const y = 642;
    this.combat.hand.slice(0, 5).forEach((cardId, index) => {
      const card = cardById(cardId);
      const x = startX + index * 136;
      const c = this.add.container(x, y).setSize(108, 118);
      const usable = this.combat.actionPoints >= card.cost;
      const palette = cardPalette(card);
      const bg = this.add.rectangle(0, 0, 108, 118, usable ? palette.fill : 0x7b6847, 1).setStrokeStyle(3, usable ? palette.border : COLORS.goldDark);
      const paper = this.add.rectangle(0, 24, 76, 58, 0xf5dfb6, usable ? 0.78 : 0.48).setStrokeStyle(1, palette.border, usable ? 0.36 : 0.18);
      const seal = this.add.circle(0, 24, 15, palette.border, usable ? 0.18 : 0.1).setStrokeStyle(2, palette.border, usable ? 0.28 : 0.14);
      const strokeA = this.add.rectangle(0, 12, 44, 3, palette.border, usable ? 0.24 : 0.12);
      const strokeB = this.add.rectangle(-8, 27, 32, 3, palette.border, usable ? 0.22 : 0.1).setAngle(24);
      const strokeC = this.add.rectangle(9, 37, 30, 3, palette.border, usable ? 0.22 : 0.1).setAngle(-24);
      const tag = this.add.rectangle(0, -57, 108, 10, palette.border, usable ? 0.95 : 0.45);
      const mark = this.add.text(0, -41, `${index + 1}`, titleStyle(17)).setOrigin(0.5).setColor("#5b1612");
      const name = this.add.text(0, -19, card.name, titleStyle(16)).setOrigin(0.5).setColor("#43120f");
      const cost = this.add.text(38, -42, `${card.cost}`, textStyle(16, palette.border, { fontStyle: "bold" })).setOrigin(0.5);
      const desc = this.add.text(0, 25, card.description, textStyle(11, 0x34120d, { align: "center", lineSpacing: 3 })).setOrigin(0.5);
      const role = this.add.text(-34, -42, palette.label, textStyle(11, palette.border, { fontStyle: "bold" })).setOrigin(0.5);
      wrapText(desc, 88);
      c.add([bg, paper, seal, strokeA, strokeB, strokeC, tag, mark, name, cost, role, desc]);
      reveal(this, c, y + 28 + index * 8, y);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => {
        if (!usable) return;
        if (canAnimate(this)) this.tweens.add({ targets: c, y: y - 18, scale: 1.04, duration: 150, ease: "Sine.easeOut" });
      });
      c.on("pointerout", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, y, scale: 1, duration: 150, ease: "Sine.easeOut" });
        else c.setScale(1);
      });
      c.on("pointerdown", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 0.97, duration: 80, ease: "Sine.easeOut" });
        else c.setScale(0.97);
      });
      c.on("pointerup", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1, duration: 110, ease: "Back.easeOut" });
        else c.setScale(1);
        this.tryPlay(index);
      });
    });
  }

  private drawLog(): void {
    const lines = this.combat.log.slice(0, 4);
    this.add.text(92, 228, lines.join("\n"), textStyle(15, COLORS.text)).setWordWrapWidth(330);
  }

  private drawActiveGod(x: number, y: number): void {
    const godId = this.run.gods[0];
    if (!godId) return;
    const god = godById(godId);
    const c = this.add.container(x, y).setDepth(28);
    const bg = this.add
      .rectangle(0, 0, 162, 194, COLORS.surface, 0.66)
      .setStrokeStyle(2, COLORS.goldDark, 0.92);
    const halo = this.add.circle(0, -40, 66, COLORS.gold, 0.14).setStrokeStyle(2, COLORS.gold, 0.36);
    const portrait = this.add
      .image(0, -22, textureOr(this, godTexture(godId), "icon-token"))
      .setDisplaySize(112, 154)
      .setAlpha(0.98);
    const namePlate = this.add.rectangle(0, 72, 132, 38, COLORS.black, 0.48).setStrokeStyle(1, COLORS.goldDark, 0.6);
    const label = this.add.text(0, 58, "所请神明", textStyle(13, COLORS.muted, { align: "center" })).setOrigin(0.5);
    const name = this.add.text(0, 80, god.name, textStyle(20, COLORS.gold, { align: "center", fontStyle: "bold" })).setOrigin(0.5);
    c.add([bg, halo, portrait, namePlate, label, name]);
    reveal(this, c, y + 18, y);
    pulse(this, halo, 1.08, 1700);
    pulse(this, portrait, 1.018, 2100);
  }

  private drawHealthBar(x: number, y: number, width: number, height: number, value: number, max: number, color: number): void {
    this.add.rectangle(x + width / 2, y + height / 2, width, height, COLORS.black, 0.7).setStrokeStyle(1, COLORS.goldDark);
    const fillWidth = Math.max(0, (value / max) * (width - 4));
    this.add.rectangle(x + 2 + fillWidth / 2, y + height / 2, fillWidth, height - 4, color, 1);
    this.add.text(x + width / 2, y + height / 2, `${value}/${max}`, textStyle(13, COLORS.text)).setOrigin(0.5);
  }

  private tryPlay(index: number): void {
    if (this.busy) return;
    const result = playCard(this.run, this.combat, index);
    announce(result.message);
    if (!result.ok) {
      impactText(this, 640, 360, "不可", COLORS.muted, { text: "invalid", tone: "neutral", scale: 1.04 });
      flashAt(this, 640, 360, COLORS.goldDark, 80);
      return;
    }
    this.showCardFeedback(result);
    clampRun(this.run);
    this.busy = true;
    this.time.delayedCall(this.feedbackDelay(), () => {
      this.checkOutcome();
      if (!this.scene.isActive("CombatScene")) return;
      this.busy = false;
      this.draw();
    });
  }

  private endTurn(): void {
    if (this.busy) return;
    this.busy = true;
    enemyAct(this.run, this.combat);
    this.showEnemyFeedback();
    clampRun(this.run);
    this.time.delayedCall(this.feedbackDelay(), () => {
      this.checkOutcome();
      if (!this.scene.isActive("CombatScene")) return;
      this.busy = false;
      this.draw();
    });
  }

  private feedbackDelay(): number {
    return this.registry.get("reducedMotion") ? 80 : 320;
  }

  private checkOutcome(): void {
    if (this.combat.enemy.life <= 0) {
      const enemy = enemyById(this.combat.enemy.id);
      const reward = createVictoryReward(this.run, enemy, currentNode(this.run).id);
      if (enemy.tier === "boss") {
        this.run.result = "win";
        this.run.coins += reward.coins;
        this.run.lastMessage = `太岁劫破。获得 ${reward.coins} 铜钱。`;
        saveRun(this.run);
        this.scene.start("ResultScene", { result: "win", message: this.run.lastMessage });
        return;
      }
      this.run.pendingReward = reward;
      this.run.lastMessage = reward.message;
      saveRun(this.run);
      this.scene.start("RewardScene");
      return;
    }
    if (this.run.stats.life <= 0) {
      if (this.run.items.includes("zhiren")) {
        this.run.items = this.run.items.filter((item) => item !== "zhiren");
        this.run.stats.life = 6;
        this.combat.log.unshift("替死纸人烧成灰烬，命灯复明。");
        saveRun(this.run);
        return;
      }
      this.run.result = "lose";
      saveRun(this.run);
      this.scene.start("ResultScene", { result: "lose", message: "命数归零，符火熄灭。" });
    }
  }

  private intentLabel(intent: EnemyIntent): string {
    if (intent === "attack") return "攻击";
    if (intent === "guard") return "防御";
    if (intent === "curse") return "诅咒";
    return "蓄力";
  }

  private omenColor(): number {
    if (this.combat.omen.tone === "good") return COLORS.good;
    if (this.combat.omen.tone === "bad") return COLORS.primaryStrong;
    return COLORS.muted;
  }

  private showCardFeedback(result: CardPlayResult): void {
    if (result.damage > 0 || result.blockedDamage > 0) {
      flashAt(this, 940, 372, this.omenColor(), 120);
      particleBurst(this, 940, 360, this.fx("fuhuo", "particle-fuhuo"), { count: 9, color: this.omenColor(), spread: 82, rise: 72, ...this.fxFrameOptions("fuhuo", 3, 9) });
      if (this.enemySprite) shake(this, this.enemySprite);
      this.showCardDamageText(result);
    }
    if (result.block > 0) {
      flashAt(this, 300, 370, COLORS.good, 90);
      particleBurst(this, 300, 360, this.fx("barrier", "particle-spirit"), { count: 6, color: COLORS.good, spread: 46, rise: 52, ...this.fxFrameOptions("barrier", 0, 5) });
      impactText(this, 300, 314, `护身 +${result.block}`, COLORS.good, { text: "guard", number: result.block, signed: true, tone: "shield", persistOnRedraw: true });
    }
    if (result.heal > 0) impactText(this, 300, 348, `命数 +${result.heal}`, COLORS.good, { text: "life", number: result.heal, signed: true, tone: "heal", persistOnRedraw: true });
    if (result.divine > 0) impactText(this, 300, 382, `神力 +${result.divine}`, COLORS.spirit, { text: "divine", number: result.divine, signed: true, tone: "spirit", persistOnRedraw: true });
    if (result.luck > 0) impactText(this, 640, 240, `气运 +${result.luck}`, COLORS.gold, { text: "luck", number: result.luck, signed: true, tone: "luck", persistOnRedraw: true });
    if (result.virtue !== 0) impactText(this, 640, 278, `阴德 ${result.virtue > 0 ? "+" : ""}${result.virtue}`, COLORS.gold, { text: "virtue", number: result.virtue, signed: true, tone: "luck", persistOnRedraw: true });
    if (result.draw > 0) impactText(this, 640, 610, `抽牌 +${result.draw}`, COLORS.spirit, { text: "draw-card", number: result.draw, signed: true, tone: "spirit", persistOnRedraw: true });
    if (!result.damage && !result.block && !result.heal && !result.divine && !result.luck && !result.virtue && !result.draw) {
      flashAt(this, 300, 370, COLORS.good, 90);
      impactText(this, 300, 314, "符成", COLORS.good, { text: "cast-success", tone: "heal", scale: 1.04 });
    }
  }

  private showEnemyFeedback(): void {
    const latest = this.combat.log[0] ?? "";
    if (latest.includes("造成")) {
      flashAt(this, 300, 370, COLORS.danger, 100);
      this.heroSprite?.setTexture(textureOr(this, "hero-hit", "hero"));
      if (this.heroSprite) shake(this, this.heroSprite);
      this.showEnemyDamageText(this.latestEnemyDamage());
      return;
    }
    flashAt(this, 940, 372, COLORS.gold, 90);
    particleBurst(this, 940, 352, this.fx("paper-money", "particle-paper"), { count: 9, color: COLORS.gold, spread: 64, rise: 62, ...this.fxFrameOptions("paper-money", 0, 7) });
    impactText(this, 940, 312, latest.includes("蓄") ? "蓄" : "咒", COLORS.gold, { text: latest.includes("蓄") ? "charge" : "curse", tone: "luck", scale: 1.05 });
  }

  private fx(key: string, fallback: string): string {
    return textureOr(this, fxTexture(key), fallback);
  }

  private fxFrameOptions(key: string, frameStart: number, frameEnd: number): { frameStart?: number; frameEnd?: number } {
    return this.textures.exists(fxTexture(key)) ? { frameStart, frameEnd } : {};
  }

  private showCardDamageText(result: CardPlayResult): void {
    if (result.damage > 0) {
      impactText(this, 940, 306, `伤害 -${result.damage}`, COLORS.primaryStrong, {
        text: "damage",
        number: -result.damage,
        signed: true,
        tone: result.damage >= 12 ? "critical" : "damage",
        persistOnRedraw: true,
      });
    }
    if (result.blockedDamage > 0) {
      impactText(this, 940, 350, `破盾 -${result.blockedDamage}`, COLORS.gold, {
        text: "break-shield",
        number: -result.blockedDamage,
        signed: true,
        tone: "shield",
        persistOnRedraw: true,
      });
    }
  }

  private showEnemyDamageText(damage: number): void {
    if (damage <= 0) return;
    impactText(this, 300, 314, `伤害 -${damage}`, COLORS.danger, {
      text: "damage",
      number: -damage,
      signed: true,
      tone: "damage",
      persistOnRedraw: true,
    });
  }

  private latestEnemyDamage(): number {
    const match = (this.combat.log[0] ?? "").match(/造成 (\d+) 伤害/);
    return match ? Number(match[1]) : 0;
  }
}
