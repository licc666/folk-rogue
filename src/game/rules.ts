import { CARDS, ENEMIES, GODS, ITEMS, OMENS } from "./data";
import type {
  CardConfig,
  CardPlayResult,
  CombatState,
  EnemyConfig,
  EnemyIntent,
  GodId,
  ItemConfig,
  OmenConfig,
  PendingReward,
  RunState,
} from "./types";

export function byId<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing config: ${id}`);
  return item;
}

export const cardById = (id: string) => byId(CARDS, id);
export const enemyById = (id: string) => byId(ENEMIES, id);
export const itemById = (id: string) => byId(ITEMS, id);
export const godById = (id: GodId) => byId(GODS, id);

function createPlayResult(message: string, ok = true): CardPlayResult {
  return {
    ok,
    message,
    damage: 0,
    blockedDamage: 0,
    block: 0,
    heal: 0,
    divine: 0,
    luck: 0,
    virtue: 0,
    draw: 0,
  };
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function drawOmen(luck: number): OmenConfig {
  const adjusted = OMENS.map((omen) => {
    const luckBonus = omen.tone === "good" ? luck * 3 : omen.tone === "bad" ? luck * -2 : luck;
    return { omen, weight: Math.max(2, omen.weight + luckBonus) };
  });
  const total = adjusted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of adjusted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.omen;
  }
  return OMENS[2];
}

export function createCombat(run: RunState, enemyId: string): CombatState {
  const enemy = enemyById(enemyId);
  const startBlock =
    (run.items.includes("xiangnang") ? 3 : 0) + (run.gods.includes("tudi") ? 4 : 0);
  if (run.items.includes("pingankou")) run.stats.life = Math.min(run.stats.maxLife, run.stats.life + 2);
  if (run.items.includes("xuefushu")) run.stats.longevity = Math.max(0, run.stats.longevity - 1);
  const combat: CombatState = {
    enemy: {
      id: enemy.id,
      life: enemy.maxLife,
      maxLife: enemy.maxLife,
      block: enemy.armor,
      intentIndex: 0,
      charged: false,
    },
    drawPile: shuffle(run.deck),
    hand: [],
    discardPile: [],
    actionPoints: 3,
    block: startBlock,
    turn: 0,
    omen: drawOmen(run.stats.luck),
    log: [`${enemy.name} 于阴影中现身。`],
  };
  startTurn(run, combat);
  return combat;
}

export function startTurn(run: RunState, combat: CombatState): void {
  combat.turn += 1;
  combat.actionPoints = 3;
  combat.block = combat.turn === 1 ? combat.block : 0;
  combat.omen = drawOmen(run.stats.luck);
  if (run.items.includes("heimu") && combat.omen.id === "greatBad") {
    run.stats.divine += 1;
    combat.log.unshift("黑木神像映出倒影，大凶也化出 1 点神力。");
  }
  drawCards(combat, 5);
  combat.log.unshift(`第 ${combat.turn} 回合抽得「${combat.omen.name}」：${combat.omen.description}`);
}

export function drawCards(combat: CombatState, count: number): void {
  for (let i = 0; i < count; i += 1) {
    if (combat.drawPile.length === 0) {
      combat.drawPile = shuffle(combat.discardPile);
      combat.discardPile = [];
    }
    const card = combat.drawPile.pop();
    if (card) combat.hand.push(card);
  }
}

export function currentIntent(enemy: EnemyConfig, combat: CombatState): EnemyIntent {
  return enemy.intents[combat.enemy.intentIndex % enemy.intents.length];
}

export function playCard(run: RunState, combat: CombatState, handIndex: number): CardPlayResult {
  const cardId = combat.hand[handIndex];
  if (!cardId) return createPlayResult("没有这张符纸。", false);
  const card = cardById(cardId);
  const stampedDiscount = run.items.includes("yuxi") && combat.turn === 1 && combat.discardPile.length === 0 ? 1 : 0;
  const actionCost = Math.max(0, card.cost - stampedDiscount);
  if (combat.actionPoints < actionCost) return createPlayResult("行动点不足。", false);
  if ((card.divine ?? 0) < 0 && run.stats.divine < Math.abs(card.divine ?? 0)) return createPlayResult("神力不足。", false);
  if ((card.longevityCost ?? 0) > run.stats.longevity) return createPlayResult("阳寿不足。", false);

  combat.actionPoints -= actionCost;
  combat.hand.splice(handIndex, 1);
  combat.discardPile.push(card.id);

  const result = resolveCard(run, combat, card);
  if (run.gods.includes("huxian") && combat.omen.tone === "bad" && Math.random() < 0.35) {
    drawCards(combat, 1);
    result.draw += 1;
    result.message += " 狐仙笑了一声，又借你一张牌。";
  }
  combat.log.unshift(result.message);
  return result;
}

function resolveCard(run: RunState, combat: CombatState, card: CardConfig): CardPlayResult {
  const result = createPlayResult("");
  const parts: string[] = [`打出「${card.name}」。`];
  if (card.longevityCost) {
    run.stats.longevity -= card.longevityCost;
    parts.push(`阳寿 -${card.longevityCost}。`);
  }
  if (card.divine) {
    run.stats.divine = Math.max(0, run.stats.divine + card.divine);
    result.divine += card.divine;
    parts.push(card.divine > 0 ? `神力 +${card.divine}。` : `神力 ${card.divine}。`);
  }
  if (card.luck) {
    run.stats.luck += card.luck;
    result.luck += card.luck;
    parts.push(`气运 +${card.luck}。`);
  }
  if (card.virtue) {
    run.stats.virtue += card.virtue;
    result.virtue += card.virtue;
    parts.push(card.virtue > 0 ? `阴德 +${card.virtue}。` : `阴德 ${card.virtue}。`);
  }
  if (card.heal) {
    run.stats.life = Math.min(run.stats.maxLife, run.stats.life + card.heal);
    result.heal += card.heal;
    parts.push(`命数 +${card.heal}。`);
  }
  if (card.block) {
    combat.block += card.block;
    result.block += card.block;
    parts.push(`护身 +${card.block}。`);
  }
  if (card.damage) {
    let damage = Math.ceil(card.damage * combat.omen.multiplier);
    if (run.items.includes("taomu") && card.type === "attack") damage += 1;
    if (run.items.includes("bagua") && (combat.omen.id === "great" || combat.omen.id === "middle")) damage += 2;
    if (run.items.includes("leijimu") && card.id === "leihuo") damage += 4;
    if (run.items.includes("xuefushu") && card.type === "attack") damage += 2;
    if (run.gods.includes("guandi") && combat.turn === 1 && card.type === "attack") damage += 3;
    if (run.gods.includes("leigong") && combat.omen.id === "great") damage += 4;
    if (run.gods.includes("chenghuang") && run.stats.virtue > 0) damage += 1;
    const blocked = Math.min(combat.enemy.block, damage);
    combat.enemy.block -= blocked;
    const dealt = Math.max(0, damage - blocked);
    combat.enemy.life = Math.max(0, combat.enemy.life - dealt);
    result.damage += dealt;
    result.blockedDamage += blocked;
    parts.push(`造成 ${dealt} 伤害。`);
  }
  if (card.draw) {
    drawCards(combat, card.draw);
    result.draw += card.draw;
    parts.push(`抽 ${card.draw} 张。`);
  }
  result.message = parts.join("");
  return result;
}

export function enemyAct(run: RunState, combat: CombatState): string {
  const enemy = enemyById(combat.enemy.id);
  const intent = currentIntent(enemy, combat);
  let message = "";
  if (intent === "attack") {
    const rawDamage = enemy.attack + (combat.enemy.charged ? 5 : 0);
    const blocked = Math.min(combat.block, rawDamage);
    combat.block -= blocked;
    const damage = Math.max(0, rawDamage - blocked);
    run.stats.life = Math.max(0, run.stats.life - damage);
    if (run.items.includes("hushenyu")) combat.block = Math.max(combat.block, Math.min(2, blocked));
    combat.enemy.charged = false;
    message = `${enemy.name} 攻来，造成 ${damage} 伤害。`;
  }
  if (intent === "guard") {
    combat.enemy.block += enemy.armor + 5;
    message = `${enemy.name} 收拢阴气，护身 +${enemy.armor + 5}。`;
  }
  if (intent === "curse") {
    run.stats.luck -= 1;
    message = `${enemy.name} 念出旧债，气运 -1。`;
  }
  if (intent === "charge") {
    combat.enemy.charged = true;
    message = `${enemy.name} 蓄起劫气，下次攻击更重。`;
  }
  combat.enemy.intentIndex += 1;
  combat.log.unshift(message);
  combat.discardPile.push(...combat.hand);
  combat.hand = [];
  if (run.stats.life > 0 && combat.enemy.life > 0) startTurn(run, combat);
  return message;
}

export function createVictoryReward(run: RunState, enemy: EnemyConfig, sourceNodeId: string): PendingReward {
  let coins = enemy.rewardCoins;
  if (run.gods.includes("caishen")) coins += 5;
  if (run.items.includes("gongdexiang")) coins += Math.max(0, run.stats.virtue) * 2;
  if (enemy.tier === "elite") coins += 8;
  const pool = ["leihuo", "chaodu", "jieming", "quhui", "xuefu", "qingshen", "yinguo", "zhuanyun"];
  const cards = shuffle(pool).slice(0, 3);
  return {
    coins,
    cards,
    sourceNodeId,
    message: `胜利。获得 ${coins} 铜钱，可择一张符纸入册。`,
  };
}

export function applyRewardChoice(run: RunState, cardId?: string): string {
  const reward = run.pendingReward;
  if (!reward) return "没有可领取的战利品。";
  run.coins += reward.coins;
  let message = `领取 ${reward.coins} 铜钱。`;
  if (cardId) {
    run.deck.push(cardId);
    message += ` 收得「${cardById(cardId).name}」。`;
  } else {
    message += " 未收新符。";
  }
  run.pendingReward = undefined;
  return message;
}

export function applyItem(run: RunState, item: ItemConfig): string {
  if (item.id === "qingxiang") run.stats.life = Math.min(run.stats.maxLife, run.stats.life + 3);
  if (item.id === "gaoxiang") run.stats.divine += 2;
  if (item.id === "huanyuan") {
    run.stats.virtue += 1;
    run.stats.luck += 1;
  }
  if (item.id === "jiemingdeng") {
    run.stats.life = Math.min(run.stats.maxLife, run.stats.life + 5);
    run.stats.longevity = Math.max(0, run.stats.longevity - 1);
  }
  if (item.id === "yinqiandai") {
    run.coins += 20;
    run.stats.virtue -= 1;
  }
  if (item.id === "heimu") run.stats.virtue -= 1;
  return `获得「${item.name}」。${item.description}`;
}
