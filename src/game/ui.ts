import Phaser from "phaser";
import { combatTextTexture, fxTexture, statTexture, textureOr, uiTexture } from "./assets";
import { COLORS, FONT } from "./tokens";
import type { PlayerStats, RunState } from "./types";

const MOTION = {
  press: 120,
  reveal: 220,
  feedback: 260,
  ambient: 2800,
};

type ImpactTextTone = "damage" | "critical" | "shield" | "heal" | "spirit" | "luck" | "neutral";

interface ImpactTextOptions {
  backplate?: string;
  text?: string;
  number?: number;
  signed?: boolean;
  tone?: ImpactTextTone;
  scale?: number;
}

const DIGIT_TEXTURES: Record<ImpactTextTone, string> = {
  damage: "digits-damage-red",
  critical: "digits-damage-critical",
  shield: "digits-shield-gold",
  heal: "digits-heal-green",
  spirit: "digits-spirit-blue",
  luck: "digits-luck-gold",
  neutral: "digits-neutral-muted",
};

const DIGIT_FRAMES: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "-": 10,
  "+": 11,
};

export function textStyle(size: number, color = COLORS.text, extra: Phaser.Types.GameObjects.Text.TextStyle = {}) {
  return {
    fontFamily: FONT.body,
    fontSize: `${size}px`,
    color: `#${color.toString(16).padStart(6, "0")}`,
    lineSpacing: 8,
    ...extra,
  };
}

export function titleStyle(size: number) {
  return textStyle(size, COLORS.text, {
    fontFamily: FONT.title,
    fontStyle: "bold",
  });
}

export function canAnimate(scene: Phaser.Scene): boolean {
  return !scene.registry.get("reducedMotion");
}

export function createStageBackground(scene: Phaser.Scene, title?: string, backgroundKey?: string): void {
  const { width, height } = scene.scale;
  const hasBackgroundArt = Boolean(backgroundKey && scene.textures.exists(backgroundKey));
  scene.add.rectangle(width / 2, height / 2, width, height, COLORS.bg).setDepth(-12);
  if (hasBackgroundArt && backgroundKey) {
    scene.add.image(width / 2, height / 2, backgroundKey).setDisplaySize(width, height).setAlpha(0.72).setDepth(-11);
  }

  const g = scene.add.graphics().setDepth(-9);
  if (hasBackgroundArt) {
    g.fillStyle(COLORS.bg, 0.38).fillRect(0, 0, width, height);
    g.fillStyle(0x06100f, 0.62).fillRect(0, height * 0.68, width, height * 0.32);
    g.fillStyle(COLORS.black, 0.18).fillRect(0, 0, width, 112);
  } else {
    g.fillStyle(COLORS.bg2, 1).fillRect(0, 0, width, height);
    g.fillStyle(0x0d2422, 0.8).fillRect(0, height * 0.12, width, height * 0.55);
    g.fillStyle(0x101512, 1).fillRect(0, height * 0.72, width, height * 0.28);
  }
  g.lineStyle(3, COLORS.goldDark, 0.7);
  g.strokeRect(48, 48, width - 96, height - 96);
  g.lineStyle(1, COLORS.goldDark, 0.45);
  for (let x = 90; x < width - 80; x += 82) {
    g.lineBetween(x, 52, x + 28, 92);
    g.lineBetween(x + 28, 92, x + 56, 52);
  }
  g.fillStyle(COLORS.primary, 0.18);
  for (let i = 0; i < 9; i += 1) {
    const x = 110 + i * 130;
    g.fillRect(x, 74, 24, 118);
    g.fillStyle(COLORS.gold, 0.12);
    g.fillRect(x + 3, 78, 18, 20);
    g.fillStyle(COLORS.primary, 0.18);
  }
  g.fillStyle(COLORS.black, 0.35).fillEllipse(width / 2, height * 0.78, width * 0.68, 70);

  if (title) {
    scene.add.text(64, 44, title, titleStyle(28)).setDepth(20);
  }

  addStageAtmosphere(scene);
}

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  options: { primary?: boolean; disabled?: boolean; aria?: string } = {},
): Phaser.GameObjects.Container {
  const disabled = options.disabled ?? false;
  const textureKey = options.primary ? uiTexture("button-primary") : uiTexture("button-secondary");
  const hasButtonArt = scene.textures.exists(textureKey);
  const bg = scene.add
    .rectangle(0, 0, Math.max(44, width), Math.max(44, height), options.primary ? COLORS.primary : COLORS.surfaceStrong, 0.96)
    .setStrokeStyle(2, disabled ? COLORS.goldDark : COLORS.gold, disabled ? 0.45 : 1);
  const art = hasButtonArt
    ? scene.add.image(0, 0, textureKey, disabled ? 2 : 0).setDisplaySize(Math.max(44, width), Math.max(44, height)).setAlpha(disabled ? 0.62 : 0.95)
    : undefined;
  const txt = scene.add
    .text(0, 0, label, textStyle(18, disabled ? COLORS.muted : COLORS.text, { align: "center" }))
    .setOrigin(0.5);
  txt.setWordWrapWidth(Math.max(44, width) - 24, true);
  const c = scene.add.container(x, y, [bg, ...(art ? [art] : []), txt]).setSize(Math.max(44, width), Math.max(44, height));
  c.setAlpha(disabled ? 0.5 : 1);
  if (!disabled) {
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => {
      bg.setFillStyle(options.primary ? COLORS.primaryStrong : COLORS.surface);
      art?.setFrame(1);
      if (canAnimate(scene)) scene.tweens.add({ targets: c, scale: 1.025, duration: MOTION.press, ease: "Sine.easeOut" });
    });
    c.on("pointerout", () => {
      bg.setFillStyle(options.primary ? COLORS.primary : COLORS.surfaceStrong);
      art?.setFrame(0);
      if (canAnimate(scene)) scene.tweens.add({ targets: c, scale: 1, duration: MOTION.press, ease: "Sine.easeOut" });
    });
    c.on("pointerdown", () => {
      art?.setFrame(1);
      if (canAnimate(scene)) {
        scene.tweens.add({ targets: c, scale: 0.965, duration: 80, ease: "Sine.easeOut" });
      } else {
        c.setScale(0.98);
      }
      announce(options.aria ?? label);
    });
    c.on("pointerup", () => {
      if (canAnimate(scene)) scene.tweens.add({ targets: c, scale: 1, duration: MOTION.press, ease: "Back.easeOut" });
      else c.setScale(1);
      onClick();
    });
  }
  reveal(scene, c, y + 10, y);
  return c;
}

export function addPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.92,
): Phaser.GameObjects.Rectangle | Phaser.GameObjects.Container {
  const textureKey = width > 860 ? uiTexture("panel-temple") : uiTexture("panel-paper");
  if (scene.textures.exists(textureKey)) {
    const base = scene.add
      .rectangle(0, 0, width, height, COLORS.surface, alpha * 0.82)
      .setStrokeStyle(2, COLORS.goldDark, 0.72);
    const paper = scene.add.image(0, 0, textureKey).setDisplaySize(width, height).setAlpha(Math.min(0.76, alpha));
    const veil = scene.add.rectangle(0, 0, width - 18, height - 14, COLORS.bg, Math.max(0.1, 0.28 - alpha * 0.08));
    return scene.add.container(x, y, [base, paper, veil]).setSize(width, height);
  }
  return scene.add
    .rectangle(x, y, width, height, COLORS.surface, alpha)
    .setStrokeStyle(2, COLORS.goldDark, 0.9);
}

export function addStatsBar(scene: Phaser.Scene, run: RunState): Phaser.GameObjects.Container {
  const { width } = scene.scale;
  const bg = scene.add.rectangle(0, 0, width - 96, 52, COLORS.surface, 0.95).setStrokeStyle(1, COLORS.goldDark);
  const statEntries = [
    { key: "life", label: `命数 ${run.stats.life}/${run.stats.maxLife}` },
    { key: "divine", label: `神力 ${run.stats.divine}` },
    { key: "longevity", label: `阳寿 ${run.stats.longevity}` },
    { key: "virtue", label: `阴德 ${run.stats.virtue}` },
    { key: "luck", label: `气运 ${run.stats.luck}` },
  ];
  const entries = statEntries.map((entry, index) => {
    const x = -width / 2 + 74 + index * 158;
    const iconKey = statTexture(entry.key);
    const icon = scene.add.image(x, 0, scene.textures.exists(iconKey) ? iconKey : "icon-token").setDisplaySize(28, 28);
    const text = scene.add.text(x + 21, -10, entry.label, textStyle(15, COLORS.text));
    return scene.add.container(0, 0, [icon, text]);
  });
  const coinIcon = scene.add.image(width / 2 - 218, 0, textureOr(scene, uiTexture("coin"), "icon-token")).setDisplaySize(28, 28);
  const coinText = scene.add.text(width / 2 - 197, -10, `铜钱 ${run.coins}`, textStyle(15, COLORS.text));
  const bar = scene.add.container(width / 2, 70, [bg, ...entries, coinIcon, coinText]).setDepth(40);
  reveal(scene, bar, 58, 70);
  return bar;
}

export function statsLabels(stats: PlayerStats, coins: number): string[] {
  return [
    `命数 ${stats.life}/${stats.maxLife}`,
    `神力 ${stats.divine}`,
    `阳寿 ${stats.longevity}`,
    `阴德 ${stats.virtue}`,
    `气运 ${stats.luck}`,
    `铜钱 ${coins}`,
  ];
}

export function announce(message: string): void {
  const el = document.getElementById("announcer");
  if (el) el.textContent = message;
}

export function wrapText(text: Phaser.GameObjects.Text, width: number): Phaser.GameObjects.Text {
  text.setWordWrapWidth(width, true);
  return text;
}

export function addSmoke(scene: Phaser.Scene): void {
  if (!canAnimate(scene)) return;
  const { width, height } = scene.scale;
  const smokeTexture = fxTexture("smoke");
  if (scene.textures.exists(smokeTexture)) {
    for (let i = 0; i < 6; i += 1) {
      const smoke = scene.add.image(150 + i * 190, height - 118, smokeTexture, Phaser.Math.Between(0, 7)).setAlpha(0.13).setDepth(-4);
      smoke.setDisplaySize(132 + i * 6, 132 + i * 6);
      scene.tweens.add({
        targets: smoke,
        y: height - 245 - i * 10,
        x: smoke.x + Phaser.Math.Between(-38, 38),
        alpha: 0,
        scale: 1.9,
        angle: Phaser.Math.Between(-18, 18),
        duration: 3000 + i * 260,
        repeat: -1,
        delay: i * 210,
      });
    }
    return;
  }
  for (let i = 0; i < 8; i += 1) {
    const smoke = scene.add.circle(140 + i * 140, height - 110, 16 + i * 2, COLORS.muted, 0.08);
    scene.tweens.add({
      targets: smoke,
      y: height - 210 - i * 12,
      alpha: 0,
      scale: 2.2,
      duration: 2600 + i * 240,
      repeat: -1,
      delay: i * 180,
    });
  }
}

export function reveal(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  fromY?: number,
  toY?: number,
): void {
  if (!canAnimate(scene) || scene.registry.get("suppressReveal")) return;
  const targetWithAlpha = target as Phaser.GameObjects.GameObject & { alpha: number; y: number };
  if (typeof fromY === "number" && typeof toY === "number") targetWithAlpha.y = fromY;
  targetWithAlpha.alpha = 0;
  scene.tweens.add({
    targets: target,
    y: typeof toY === "number" ? toY : undefined,
    alpha: 1,
    duration: MOTION.reveal,
    ease: "Sine.easeOut",
  });
}

export function pulse(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  scale = 1.06,
  duration = 900,
): void {
  if (!canAnimate(scene)) return;
  const scaledTarget = target as Phaser.GameObjects.GameObject & { scaleX?: number; scaleY?: number };
  const scaleX = scaledTarget.scaleX ?? 1;
  const scaleY = scaledTarget.scaleY ?? 1;
  scene.tweens.add({
    targets: target,
    scaleX: scaleX * scale,
    scaleY: scaleY * scale,
    duration,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

export function float(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  distance = 10,
  duration = 1800,
): void {
  if (!canAnimate(scene)) return;
  scene.tweens.add({
    targets: target,
    y: `-=${distance}`,
    duration,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

export function impactText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  color = COLORS.primaryStrong,
  options?: ImpactTextOptions,
): void {
  if (options && impactArtText(scene, x, y, label, color, options)) return;

  const text = scene.add.text(x, y, label, titleStyle(30)).setOrigin(0.5).setDepth(80);
  text.setColor(`#${color.toString(16).padStart(6, "0")}`);
  if (!canAnimate(scene)) {
    scene.time.delayedCall(650, () => text.destroy());
    return;
  }
  scene.tweens.add({
    targets: text,
    y: y - 54,
    alpha: 0,
    scale: 1.12,
    duration: 760,
    ease: "Cubic.easeOut",
    onComplete: () => text.destroy(),
  });
}

function impactArtText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  color: number,
  options: ImpactTextOptions,
): boolean {
  const textKey = options.text ? combatTextTexture(`text-${options.text}`) : undefined;
  const backplateKey = options.backplate ? combatTextTexture(`pop-${options.backplate}-backplate`) : undefined;
  const digitsKey = combatTextTexture(DIGIT_TEXTURES[options.tone ?? "neutral"]);
  const hasText = Boolean(textKey && scene.textures.exists(textKey));
  const hasBackplate = Boolean(backplateKey && scene.textures.exists(backplateKey));
  const hasDigits = typeof options.number === "number" && scene.textures.exists(digitsKey);

  if (!hasText && !hasBackplate && !hasDigits) return false;

  const scale = options.scale ?? 1;
  const c = scene.add.container(x, y).setDepth(80);
  if (hasBackplate && backplateKey) {
    c.add(scene.add.image(0, 0, backplateKey).setDisplaySize(226 * scale, 112 * scale).setAlpha(0.96));
  }
  if (hasText && textKey) {
    const textWidth = options.text === "calamity" || options.text === "charge" || options.text === "curse" ? 50 : 88;
    c.add(scene.add.image(hasDigits ? -46 * scale : 0, -2 * scale, textKey).setDisplaySize(textWidth * scale, 44 * scale));
  }
  if (hasDigits && typeof options.number === "number") {
    const numberText = formatImpactNumber(options.number, options.signed);
    const digits = createDigitRun(scene, numberText, digitsKey, scale);
    digits.setPosition(hasText ? 32 * scale : 0, 2 * scale);
    c.add(digits);
  }

  if (!hasText && !hasDigits) {
    const fallback = scene.add.text(0, 0, label, titleStyle(26)).setOrigin(0.5);
    fallback.setColor(`#${color.toString(16).padStart(6, "0")}`);
    c.add(fallback);
  }

  if (!canAnimate(scene)) {
    scene.time.delayedCall(650, () => c.destroy());
    return true;
  }
  scene.tweens.add({
    targets: c,
    y: y - 54,
    alpha: 0,
    scale: 1.12,
    duration: 760,
    ease: "Cubic.easeOut",
    onComplete: () => c.destroy(),
  });
  return true;
}

function formatImpactNumber(value: number, signed?: boolean): string {
  if (!signed) return `${value}`;
  return value > 0 ? `+${value}` : `${value}`;
}

function createDigitRun(scene: Phaser.Scene, value: string, textureKey: string, scale: number): Phaser.GameObjects.Container {
  const glyphs = [...value].filter((glyph) => typeof DIGIT_FRAMES[glyph] === "number");
  const glyphWidth = 25 * scale;
  const spacing = -2 * scale;
  const totalWidth = glyphs.length * glyphWidth + Math.max(0, glyphs.length - 1) * spacing;
  const c = scene.add.container(0, 0);
  glyphs.forEach((glyph, index) => {
    const digit = scene.add.image(index * (glyphWidth + spacing) - totalWidth / 2 + glyphWidth / 2, 0, textureKey, DIGIT_FRAMES[glyph]);
    digit.setDisplaySize(glyphWidth, glyphWidth);
    c.add(digit);
  });
  return c;
}

export function flashAt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = COLORS.gold,
  radius = 110,
): void {
  const ring = scene.add.circle(x, y, 18, color, 0.18).setStrokeStyle(3, color, 0.8).setDepth(70);
  if (!canAnimate(scene)) {
    scene.time.delayedCall(120, () => ring.destroy());
    return;
  }
  scene.tweens.add({
    targets: ring,
    scale: radius / 18,
    alpha: 0,
    duration: MOTION.feedback,
    ease: "Sine.easeOut",
    onComplete: () => ring.destroy(),
  });
}

export function particleBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  texture: string,
  options: { count?: number; color?: number; spread?: number; rise?: number; frameStart?: number; frameEnd?: number } = {},
): void {
  const count = options.count ?? 10;
  const spread = options.spread ?? 70;
  const rise = options.rise ?? 60;
  const frameEnd = options.frameEnd ?? options.frameStart;
  for (let i = 0; i < count; i += 1) {
    const frame = typeof options.frameStart === "number" ? Phaser.Math.Between(options.frameStart, frameEnd ?? options.frameStart) : undefined;
    const particle = scene.add.image(x, y, texture, frame).setDepth(75);
    if (options.color) particle.setTint(options.color);
    particle.setAlpha(0.86);
    particle.setScale(Phaser.Math.FloatBetween(0.55, 1.1));
    if (!canAnimate(scene)) {
      scene.time.delayedCall(120, () => particle.destroy());
      continue;
    }
    scene.tweens.add({
      targets: particle,
      x: x + Phaser.Math.Between(-spread, spread),
      y: y - Phaser.Math.Between(20, rise),
      angle: Phaser.Math.Between(-90, 120),
      alpha: 0,
      scale: 0.15,
      duration: Phaser.Math.Between(360, 680),
      ease: "Cubic.easeOut",
      onComplete: () => particle.destroy(),
    });
  }
}

export function shake(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  if (!canAnimate(scene)) return;
  scene.tweens.add({
    targets: target,
    x: "+=8",
    duration: 45,
    yoyo: true,
    repeat: 3,
    ease: "Sine.easeInOut",
  });
}

export function addStageAtmosphere(scene: Phaser.Scene): void {
  if (!canAnimate(scene)) return;
  const { width, height } = scene.scale;
  for (let i = 0; i < 7; i += 1) {
    const x = 120 + i * 170;
    const strip = scene.add.rectangle(x, 128, 14, 108, COLORS.primary, 0.16).setDepth(-7);
    scene.tweens.add({
      targets: strip,
      angle: i % 2 === 0 ? 2.2 : -2.2,
      alpha: 0.28,
      duration: MOTION.ambient + i * 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
  for (let i = 0; i < 16; i += 1) {
    const ash = scene.add.rectangle(
      Phaser.Math.Between(40, width - 40),
      Phaser.Math.Between(80, height - 80),
      5,
      8,
      COLORS.gold,
      0.13,
    ).setDepth(10);
    scene.tweens.add({
      targets: ash,
      x: ash.x + Phaser.Math.Between(-26, 34),
      y: ash.y + Phaser.Math.Between(36, 78),
      angle: Phaser.Math.Between(-18, 24),
      alpha: 0,
      duration: 3200 + i * 120,
      delay: i * 90,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
