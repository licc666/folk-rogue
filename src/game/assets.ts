import type Phaser from "phaser";
import type { GodId } from "./types";

const ASSET_ROOT = `${import.meta.env.BASE_URL}assets/`;

interface RuntimeAssetBase {
  key: string;
  url: string;
}

export interface RuntimeImageAsset extends RuntimeAssetBase {
  type?: "image";
}

export interface RuntimeSpriteSheetAsset extends RuntimeAssetBase {
  type: "spritesheet";
  frameWidth: number;
  frameHeight: number;
}

export type RuntimeAsset = RuntimeImageAsset | RuntimeSpriteSheetAsset;

function asset(key: string, path: string): RuntimeAsset {
  return { key, url: `${ASSET_ROOT}${path}` };
}

function spritesheet(key: string, path: string, frameWidth: number, frameHeight: number): RuntimeAsset {
  return { key, url: `${ASSET_ROOT}${path}`, type: "spritesheet", frameWidth, frameHeight };
}

export const cardTexture = (id: string): string => `card-${id}`;
export const itemTexture = (id: string): string => `item-${id}`;
export const statTexture = (id: string): string => `stat-${id}`;
export const godTexture = (id: GodId): string => `god-${id}`;
export const nodeAssetTexture = (id: string): string => `node-${id}`;
export const uiTexture = (id: string): string => `ui-${id}`;
export const fxTexture = (id: string): string => `fx-${id}`;
export const combatTextTexture = (id: string): string => `combat-text-${id}`;

const OMEN_TEXTURE_IDS: Record<string, string> = {
  great: "great",
  middle: "middle",
  small: "small",
  minorBad: "minor-bad",
  greatBad: "great-bad",
};

export const omenTexture = (id: string): string => `omen-${OMEN_TEXTURE_IDS[id] ?? id}`;
export const omenTextTexture = (id: string): string => combatTextTexture(`text-omen-${OMEN_TEXTURE_IDS[id] ?? id}`);

export const BACKGROUNDS = {
  village: "bg-deserted-village-road",
  temple: "bg-ruined-temple-interior",
  graveyard: "bg-mass-graveyard",
  underworld: "bg-chenghuang-underworld-hall",
} as const;

export const ENEMY_BACKGROUNDS: Record<string, string> = {
  youhun: BACKGROUNDS.village,
  humei: BACKGROUNDS.village,
  taozhai: BACKGROUNDS.village,
  shisha: BACKGROUNDS.graveyard,
  diaosi: BACKGROUNDS.graveyard,
  shuigui: BACKGROUNDS.graveyard,
  xianghuozei: BACKGROUNDS.temple,
  yexian: BACKGROUNDS.temple,
  shiwang: BACKGROUNDS.graveyard,
  taisui: BACKGROUNDS.underworld,
};

export const EVENT_BACKGROUNDS: Record<string, string> = {
  qiantong: BACKGROUNDS.temple,
  debt: BACKGROUNDS.village,
  huanyuan: BACKGROUNDS.temple,
  shrine: BACKGROUNDS.temple,
  lantern: BACKGROUNDS.village,
  grave: BACKGROUNDS.graveyard,
  incenseTrade: BACKGROUNDS.temple,
  bailiff: BACKGROUNDS.underworld,
  fox: BACKGROUNDS.village,
  paperBoat: BACKGROUNDS.graveyard,
};

export function textureOr(scene: Phaser.Scene, key: string, fallback: string): string {
  return scene.textures.exists(key) ? key : fallback;
}

export const RUNTIME_ASSETS: RuntimeAsset[] = [
  asset("hero", "characters/hero-folk-daoist.png"),
  asset("hero-combat", "characters/hero-combat-casting.png"),
  asset("hero-hit", "characters/hero-hit-variant.png"),
  asset("shopkeeper", "characters/shopkeeper-faceless-paper.png"),

  asset(BACKGROUNDS.village, "backgrounds/deserted-village-road.png"),
  asset(BACKGROUNDS.temple, "backgrounds/ruined-temple-interior.png"),
  asset(BACKGROUNDS.graveyard, "backgrounds/mass-graveyard.png"),
  asset(BACKGROUNDS.underworld, "backgrounds/chenghuang-underworld-hall.png"),

  asset("youhun", "enemies/youhun.png"),
  asset("ligui", "enemies/ligui.png"),
  asset("shisha", "enemies/shisha.png"),
  asset("shuigui", "enemies/shuigui.png"),
  asset("diaosi", "enemies/diaosi.png"),
  asset("xianghuozei", "enemies/xianghuozei.png"),
  asset("yexian", "enemies/yexian.png"),
  asset("shiwang", "enemies/shiwang.png"),
  asset("taisui", "enemies/taisui.png"),
  asset("humei", "enemies/humei.png"),
  asset("taozhai", "enemies/taozhai.png"),

  asset(godTexture("guandi"), "gods/guandi.png"),
  asset(godTexture("leigong"), "gods/leigong.png"),
  asset(godTexture("caishen"), "gods/caishen.png"),
  asset(godTexture("tudi"), "gods/tudi.png"),
  asset(godTexture("chenghuang"), "gods/chenghuang.png"),
  asset(godTexture("huxian"), "gods/huxian.png"),

  asset(cardTexture("zhenxie"), "cards/zhenxie.png"),
  asset(cardTexture("leihuo"), "cards/leihuo.png"),
  asset(cardTexture("posha"), "cards/posha.png"),
  asset(cardTexture("xuefu"), "cards/xuefu.png"),
  asset(cardTexture("zhuanyun"), "cards/zhuanyun.png"),
  asset(cardTexture("qingshen"), "cards/qingshen.png"),
  asset(cardTexture("tishen"), "cards/tishen.png"),
  asset(cardTexture("chaodu"), "cards/chaodu.png"),
  asset(cardTexture("juqi"), "cards/juqi.png"),
  asset(cardTexture("jieming"), "cards/jieming.png"),
  asset(cardTexture("yinguo"), "cards/yinguo.png"),
  asset(cardTexture("quhui"), "cards/quhui.png"),

  asset(itemTexture("taomu"), "items/taomu.png"),
  asset(itemTexture("bagua"), "items/bagua.png"),
  asset(itemTexture("leijimu"), "items/leijimu.png"),
  asset(itemTexture("yuxi"), "items/yuxi.png"),
  asset(itemTexture("xiangnang"), "items/xiangnang.png"),
  asset(itemTexture("pingankou"), "items/pingankou.png"),
  asset(itemTexture("zhiren"), "items/zhiren.png"),
  asset(itemTexture("hushenyu"), "items/hushenyu.png"),
  asset(itemTexture("qingxiang"), "items/qingxiang.png"),
  asset(itemTexture("gaoxiang"), "items/gaoxiang.png"),
  asset(itemTexture("huanyuan"), "items/huanyuan.png"),
  asset(itemTexture("gongdexiang"), "items/gongdexiang.png"),
  asset(itemTexture("jiemingdeng"), "items/jiemingdeng.png"),
  asset(itemTexture("yinqiandai"), "items/yinqiandai.png"),
  asset(itemTexture("xuefushu"), "items/xuefushu.png"),
  asset(itemTexture("heimu"), "items/heimu.png"),

  asset(statTexture("life"), "stats/life.png"),
  asset(statTexture("divine"), "stats/divine.png"),
  asset(statTexture("longevity"), "stats/longevity.png"),
  asset(statTexture("virtue"), "stats/virtue.png"),
  asset(statTexture("luck"), "stats/luck.png"),

  asset(nodeAssetTexture("combat"), "nodes/combat.png"),
  asset(nodeAssetTexture("elite"), "nodes/elite.png"),
  asset(nodeAssetTexture("event"), "nodes/event.png"),
  asset(nodeAssetTexture("shop"), "nodes/shop.png"),
  asset(nodeAssetTexture("boss"), "nodes/boss.png"),

  asset(omenTexture("great"), "omens/great.png"),
  asset(omenTexture("middle"), "omens/middle.png"),
  asset(omenTexture("small"), "omens/small.png"),
  asset(omenTexture("minorBad"), "omens/minor-bad.png"),
  asset(omenTexture("greatBad"), "omens/great-bad.png"),

  asset("event-qiantong", "events/qiantong.png"),
  asset("event-debt", "events/debt.png"),
  asset("event-huanyuan", "events/huanyuan.png"),
  asset("event-shrine", "events/shrine.png"),
  asset("event-lantern", "events/lantern.png"),
  asset("event-grave", "events/grave.png"),
  asset("event-incense", "events/incense.png"),
  asset("event-bailiff", "events/bailiff.png"),
  asset("event-fox", "events/fox.png"),
  asset("event-boat", "events/boat.png"),

  asset(uiTexture("coin"), "ui/coin.png"),
  asset(uiTexture("incense"), "ui/incense.png"),
  asset(uiTexture("panel-paper"), "ui/panel-paper-frame.png"),
  asset(uiTexture("panel-temple"), "ui/panel-temple-frame.png"),
  asset(uiTexture("panel-underworld"), "ui/panel-underworld-frame.png"),
  spritesheet(uiTexture("button-primary"), "ui/button-primary-sheet.png", 256, 128),
  spritesheet(uiTexture("button-secondary"), "ui/button-secondary-sheet.png", 256, 128),
  spritesheet(uiTexture("button-danger"), "ui/button-danger-sheet.png", 256, 128),

  spritesheet(fxTexture("fuhuo"), "fx/fuhuo-sheet.png", 256, 256),
  spritesheet(fxTexture("lightning"), "fx/lightning-sheet.png", 256, 256),
  spritesheet(fxTexture("smoke"), "fx/smoke-sheet.png", 256, 256),
  spritesheet(fxTexture("incense-smoke"), "fx/incense-smoke-sheet.png", 256, 256),
  spritesheet(fxTexture("paper-money"), "fx/paper-money-sheet.png", 256, 256),
  spritesheet(fxTexture("barrier"), "fx/barrier-sheet.png", 256, 256),
  spritesheet(fxTexture("critical-flash"), "fx/critical-flash-sheet.png", 256, 256),

  spritesheet(combatTextTexture("digits-damage-red"), "combat-text/digits-damage-red.png", 256, 256),
  spritesheet(combatTextTexture("digits-damage-critical"), "combat-text/digits-damage-critical.png", 256, 256),
  spritesheet(combatTextTexture("digits-shield-gold"), "combat-text/digits-shield-gold.png", 256, 256),
  spritesheet(combatTextTexture("digits-heal-green"), "combat-text/digits-heal-green.png", 256, 256),
  spritesheet(combatTextTexture("digits-spirit-blue"), "combat-text/digits-spirit-blue.png", 256, 256),
  spritesheet(combatTextTexture("digits-luck-gold"), "combat-text/digits-luck-gold.png", 256, 256),
  spritesheet(combatTextTexture("digits-neutral-muted"), "combat-text/digits-neutral-muted.png", 256, 256),
  spritesheet(combatTextTexture("symbols-combat"), "combat-text/symbols-combat.png", 256, 256),
  asset(combatTextTexture("text-damage"), "combat-text/text-damage.png"),
  asset(combatTextTexture("text-break-shield"), "combat-text/text-break-shield.png"),
  asset(combatTextTexture("text-guard"), "combat-text/text-guard.png"),
  asset(combatTextTexture("text-life"), "combat-text/text-life.png"),
  asset(combatTextTexture("text-divine"), "combat-text/text-divine.png"),
  asset(combatTextTexture("text-luck"), "combat-text/text-luck.png"),
  asset(combatTextTexture("text-virtue"), "combat-text/text-virtue.png"),
  asset(combatTextTexture("text-draw-card"), "combat-text/text-draw-card.png"),
  asset(combatTextTexture("text-invalid"), "combat-text/text-invalid.png"),
  asset(combatTextTexture("text-cast-success"), "combat-text/text-cast-success.png"),
  asset(combatTextTexture("text-calamity"), "combat-text/text-calamity.png"),
  asset(combatTextTexture("text-charge"), "combat-text/text-charge.png"),
  asset(combatTextTexture("text-curse"), "combat-text/text-curse.png"),
  asset(combatTextTexture("text-omen-great"), "combat-text/text-omen-great.png"),
  asset(combatTextTexture("text-omen-middle"), "combat-text/text-omen-middle.png"),
  asset(combatTextTexture("text-omen-small"), "combat-text/text-omen-small.png"),
  asset(combatTextTexture("text-omen-minor-bad"), "combat-text/text-omen-minor-bad.png"),
  asset(combatTextTexture("text-omen-great-bad"), "combat-text/text-omen-great-bad.png"),
  asset(combatTextTexture("pop-damage-backplate"), "combat-text/pop-damage-backplate.png"),
  asset(combatTextTexture("pop-shield-backplate"), "combat-text/pop-shield-backplate.png"),
  asset(combatTextTexture("pop-heal-backplate"), "combat-text/pop-heal-backplate.png"),
  asset(combatTextTexture("pop-spirit-backplate"), "combat-text/pop-spirit-backplate.png"),
  asset(combatTextTexture("pop-luck-backplate"), "combat-text/pop-luck-backplate.png"),
];
