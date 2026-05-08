export type SceneKey =
  | "BootScene"
  | "MenuScene"
  | "MapScene"
  | "CombatScene"
  | "EventScene"
  | "ShopScene"
  | "ResultScene";

export type StatKey = "life" | "divine" | "longevity" | "virtue" | "luck";
export type OmenId = "great" | "middle" | "small" | "minorBad" | "greatBad";
export type NodeType = "combat" | "elite" | "event" | "shop" | "boss";
export type EnemyIntent = "attack" | "guard" | "curse" | "charge";
export type EnemyTier = "normal" | "elite" | "boss";
export type CardType = "attack" | "utility" | "resource" | "special";
export type ItemType = "relic" | "protection" | "incense" | "karma";
export type GodId = "guandi" | "leigong" | "caishen" | "tudi" | "chenghuang" | "huxian";

export interface PlayerStats {
  life: number;
  maxLife: number;
  divine: number;
  longevity: number;
  virtue: number;
  luck: number;
}

export interface OmenConfig {
  id: OmenId;
  name: string;
  multiplier: number;
  weight: number;
  description: string;
  tone: "good" | "neutral" | "bad";
}

export interface CardConfig {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  damage?: number;
  block?: number;
  divine?: number;
  heal?: number;
  draw?: number;
  luck?: number;
  virtue?: number;
  longevityCost?: number;
  description: string;
}

export interface ItemConfig {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  description: string;
}

export interface GodConfig {
  id: GodId;
  name: string;
  title: string;
  description: string;
}

export interface EnemyConfig {
  id: string;
  name: string;
  tier: EnemyTier;
  maxLife: number;
  attack: number;
  armor: number;
  intents: EnemyIntent[];
  rewardCoins: number;
  description: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effects: Partial<PlayerStats> & { coins?: number; cardId?: string; itemId?: string };
}

export interface EventConfig {
  id: string;
  title: string;
  body: string;
  visualKey: string;
  choices: EventChoice[];
}

export interface MapNode {
  id: string;
  type: NodeType;
  label: string;
  enemyId?: string;
  eventId?: string;
  completed: boolean;
}

export interface PendingReward {
  coins: number;
  cards: string[];
  sourceNodeId: string;
  message: string;
}

export interface RunState {
  stats: PlayerStats;
  coins: number;
  deck: string[];
  items: string[];
  gods: GodId[];
  currentNodeIndex: number;
  nodes: MapNode[];
  completedNodes: string[];
  lastMessage: string;
  pendingReward?: PendingReward;
  result?: "win" | "lose";
}

export interface EnemyState {
  id: string;
  life: number;
  maxLife: number;
  block: number;
  intentIndex: number;
  charged: boolean;
}

export interface CombatState {
  enemy: EnemyState;
  drawPile: string[];
  hand: string[];
  discardPile: string[];
  actionPoints: number;
  block: number;
  turn: number;
  omen: OmenConfig;
  log: string[];
}

export interface CardPlayResult {
  ok: boolean;
  message: string;
  damage: number;
  blockedDamage: number;
  block: number;
  heal: number;
  divine: number;
  luck: number;
  virtue: number;
  draw: number;
}
