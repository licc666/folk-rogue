import type {
  CardConfig,
  EnemyConfig,
  EventConfig,
  GodConfig,
  ItemConfig,
  MapNode,
  OmenConfig,
  PlayerStats,
} from "./types";

export const INITIAL_STATS: PlayerStats = {
  life: 20,
  maxLife: 20,
  divine: 3,
  longevity: 12,
  virtue: 0,
  luck: 0,
};

export const OMENS: OmenConfig[] = [
  { id: "great", name: "大吉", multiplier: 2, weight: 8, description: "符火旺盛，伤害翻倍。", tone: "good" },
  { id: "middle", name: "中吉", multiplier: 1.5, weight: 18, description: "神意相助，伤害提高。", tone: "good" },
  { id: "small", name: "小吉", multiplier: 1.2, weight: 34, description: "气脉顺行，略有加成。", tone: "neutral" },
  { id: "minorBad", name: "小凶", multiplier: 0.85, weight: 25, description: "阴风扰符，伤害降低。", tone: "bad" },
  { id: "greatBad", name: "大凶", multiplier: 0.6, weight: 15, description: "劫气压身，伤害大减。", tone: "bad" },
];

export const CARDS: CardConfig[] = [
  { id: "zhenxie", name: "镇邪符", type: "attack", cost: 1, damage: 5, description: "造成 5 点基础伤害，受签运影响。" },
  { id: "posha", name: "破煞符", type: "attack", cost: 1, damage: 7, description: "造成 7 点基础伤害。" },
  { id: "juqi", name: "聚气符", type: "resource", cost: 0, divine: 1, draw: 1, description: "获得 1 神力，抽 1 张牌。" },
  { id: "zhuanyun", name: "转运符", type: "utility", cost: 1, luck: 1, block: 3, description: "本局气运 +1，并获得 3 护身。" },
  { id: "tishen", name: "替身符", type: "utility", cost: 1, block: 8, description: "获得 8 护身。" },
  { id: "leihuo", name: "雷火符", type: "attack", cost: 2, damage: 11, divine: -1, description: "消耗 1 神力，造成 11 点基础伤害。" },
  { id: "xuefu", name: "血符", type: "attack", cost: 0, damage: 9, longevityCost: 1, description: "消耗 1 阳寿，造成 9 点基础伤害。" },
  { id: "qingshen", name: "请神符", type: "utility", cost: 2, divine: 2, description: "凝聚香火，获得 2 神力。" },
  { id: "chaodu", name: "超度符", type: "utility", cost: 1, damage: 3, virtue: 1, description: "造成 3 点伤害，阴德 +1。" },
  { id: "jieming", name: "借命符", type: "resource", cost: 1, heal: 4, longevityCost: 1, description: "消耗 1 阳寿，回复 4 命数。" },
  { id: "yinguo", name: "因果符", type: "special", cost: 1, damage: 4, virtue: -1, draw: 2, description: "阴德 -1，造成 4 点伤害，抽 2 张。" },
  { id: "quhui", name: "驱秽符", type: "special", cost: 1, block: 4, luck: 1, description: "获得 4 护身，气运 +1。" },
];

export const INITIAL_DECK = [
  "zhenxie",
  "zhenxie",
  "zhenxie",
  "zhenxie",
  "posha",
  "posha",
  "juqi",
  "juqi",
  "zhuanyun",
  "tishen",
];

export const GODS: GodConfig[] = [
  { id: "guandi", name: "关帝", title: "武神正气", description: "每场战斗首次攻击额外 +3 伤害。" },
  { id: "leigong", name: "雷公", title: "五雷轰顶", description: "大吉时攻击再追加 4 点雷伤。" },
  { id: "caishen", name: "财神", title: "香火财路", description: "战斗胜利额外获得 5 铜钱。" },
  { id: "tudi", name: "土地公", title: "一方庇护", description: "每场战斗开始获得 4 护身。" },
  { id: "chenghuang", name: "城隍", title: "阴司审判", description: "阴德大于 0 时攻击额外 +1。" },
  { id: "huxian", name: "狐仙", title: "机缘赌运", description: "小凶和大凶也有概率抽 1 张牌。" },
];

export const ITEMS: ItemConfig[] = [
  { id: "taomu", name: "桃木剑", type: "relic", price: 28, description: "攻击符纸基础伤害 +1。" },
  { id: "bagua", name: "八卦剑", type: "relic", price: 42, description: "大吉和中吉时额外 +2 伤害。" },
  { id: "leijimu", name: "雷击木", type: "relic", price: 36, description: "雷火符额外 +4 伤害。" },
  { id: "yuxi", name: "镇符玉玺", type: "relic", price: 46, description: "每场战斗首次符纸费用 -1。" },
  { id: "xiangnang", name: "香囊", type: "protection", price: 22, description: "每场战斗开始获得 3 护身。" },
  { id: "pingankou", name: "平安扣", type: "protection", price: 26, description: "每场战斗开始命数 +2。" },
  { id: "zhiren", name: "替死纸人", type: "protection", price: 38, description: "命数首次低于 1 时回复到 6，随后消耗。" },
  { id: "hushenyu", name: "护身玉", type: "protection", price: 34, description: "受到攻击后保留 2 点护身到下回合。" },
  { id: "qingxiang", name: "一炷清香", type: "incense", price: 14, description: "购买后回复 3 命数。" },
  { id: "gaoxiang", name: "高香", type: "incense", price: 24, description: "购买后神力 +2。" },
  { id: "huanyuan", name: "还愿牌", type: "incense", price: 20, description: "阴德 +1，气运 +1。" },
  { id: "gongdexiang", name: "功德箱凭据", type: "incense", price: 30, description: "阴德越高，战斗奖励铜钱越多。" },
  { id: "jiemingdeng", name: "借命灯", type: "karma", price: 18, description: "命数 +5，阳寿 -1。" },
  { id: "yinqiandai", name: "阴钱袋", type: "karma", price: 0, description: "获得 20 铜钱，但阴德 -1。" },
  { id: "xuefushu", name: "血写符书", type: "karma", price: 32, description: "攻击符纸 +2 伤害，但每场战斗开始阳寿 -1。" },
  { id: "heimu", name: "黑木神像", type: "karma", price: 28, description: "大凶时也能获得 1 神力，但阴德 -1。" },
];

export const ENEMIES: EnemyConfig[] = [
  { id: "youhun", name: "游魂", tier: "normal", maxLife: 22, attack: 5, armor: 0, intents: ["attack", "curse", "attack"], rewardCoins: 14, description: "衣袍残破的游魂，常随阴风而至。" },
  { id: "ligui", name: "厉鬼", tier: "normal", maxLife: 28, attack: 7, armor: 0, intents: ["attack", "attack", "curse"], rewardCoins: 18, description: "怨气结在喉间，哭声像裂帛。" },
  { id: "humei", name: "狐魅", tier: "normal", maxLife: 24, attack: 6, armor: 1, intents: ["curse", "guard", "attack"], rewardCoins: 17, description: "红袖半掩，笑意里藏着倒签。" },
  { id: "shisha", name: "尸煞", tier: "normal", maxLife: 30, attack: 7, armor: 2, intents: ["guard", "attack", "attack"], rewardCoins: 18, description: "寿衣僵直，额贴旧符。" },
  { id: "shuigui", name: "水鬼", tier: "normal", maxLife: 25, attack: 6, armor: 1, intents: ["curse", "attack", "guard"], rewardCoins: 16, description: "湿发贴面，脚下滴着黑水。" },
  { id: "diaosi", name: "吊死鬼", tier: "normal", maxLife: 27, attack: 8, armor: 0, intents: ["charge", "attack", "curse"], rewardCoins: 19, description: "白绫高悬，影子比身形更长。" },
  { id: "xianghuozei", name: "香火贼", tier: "normal", maxLife: 26, attack: 5, armor: 2, intents: ["guard", "curse", "attack"], rewardCoins: 24, description: "怀里塞满断香和碎铜钱。" },
  { id: "taozhai", name: "讨债鬼", tier: "normal", maxLife: 26, attack: 6, armor: 1, intents: ["curse", "attack", "charge", "attack"], rewardCoins: 22, description: "手执账册，只认因果不认人情。" },
  { id: "yexian", name: "破庙野仙", tier: "elite", maxLife: 46, attack: 9, armor: 3, intents: ["curse", "guard", "attack", "charge", "attack"], rewardCoins: 36, description: "半截神像里寄着野路香火，受拜也索命。" },
  { id: "shiwang", name: "乱葬岗尸王", tier: "elite", maxLife: 52, attack: 10, armor: 4, intents: ["guard", "attack", "charge", "attack", "curse"], rewardCoins: 40, description: "众尸阴气合成的高大尸影，额心符钉早已松动。" },
  { id: "taisui", name: "犯太岁", tier: "boss", maxLife: 72, attack: 11, armor: 5, intents: ["charge", "attack", "curse", "guard", "attack"], rewardCoins: 60, description: "牌位、命盘与劫火缠成的灾厄神影。" },
];

export const EVENTS: EventConfig[] = [
  {
    id: "qiantong",
    title: "破庙求签",
    body: "断梁下有一只旧签筒，无人摇动却自有声响。",
    visualKey: "event-qiantong",
    choices: [
      { id: "pray", label: "焚香求签", description: "气运 +2，铜钱 -8。", effects: { luck: 2, coins: -8 } },
      { id: "leave", label: "绕柱而过", description: "阴德 +1。", effects: { virtue: 1 } },
    ],
  },
  {
    id: "debt",
    title: "路遇讨债鬼",
    body: "窄巷尽头，一册旧账摊开，上面写着你的生辰。",
    visualKey: "event-debt",
    choices: [
      { id: "pay", label: "还一笔阴债", description: "铜钱 -10，阴德 +2。", effects: { coins: -10, virtue: 2 } },
      { id: "deny", label: "撕账逃离", description: "铜钱 +12，阴德 -1。", effects: { coins: 12, virtue: -1 } },
    ],
  },
  {
    id: "huanyuan",
    title: "还愿牌",
    body: "旧愿牌挂满庙廊，有一块空白木牌正等着你的名字。",
    visualKey: "event-huanyuan",
    choices: [
      { id: "write", label: "补上旧愿", description: "阴德 +2，铜钱 -6。", effects: { virtue: 2, coins: -6 } },
      { id: "take", label: "取走愿牌", description: "获得还愿牌，气运 -1。", effects: { itemId: "huanyuan", luck: -1 } },
    ],
  },
  {
    id: "shrine",
    title: "神龛异响",
    body: "神龛深处传来木头开裂声，一枚朱砂印从帘后滚出。",
    visualKey: "event-shrine",
    choices: [
      { id: "kowtow", label: "叩首请示", description: "神力 +2，阴德 +1。", effects: { divine: 2, virtue: 1 } },
      { id: "seal", label: "收下朱印", description: "获得镇符玉玺，阳寿 -1。", effects: { itemId: "yuxi", longevity: -1 } },
    ],
  },
  {
    id: "lantern",
    title: "夜半借火",
    body: "纸灯笼贴着地面飘来，灯芯像一粒未熄的朱砂。",
    visualKey: "event-lantern",
    choices: [
      { id: "borrow", label: "借灯点符", description: "获得雷火符，阳寿 -1。", effects: { cardId: "leihuo", longevity: -1 } },
      { id: "guard", label: "护住命灯", description: "命数 +3。", effects: { life: 3 } },
    ],
  },
  {
    id: "grave",
    title: "乱葬岗拾物",
    body: "野草里半埋着一块焦黑古木，木纹间还有雷光游走。",
    visualKey: "event-grave",
    choices: [
      { id: "take", label: "拾起雷木", description: "获得雷击木，阴德 -1。", effects: { itemId: "leijimu", virtue: -1 } },
      { id: "bury", label: "重新掩埋", description: "阴德 +2，命数 +2。", effects: { virtue: 2, life: 2 } },
    ],
  },
  {
    id: "incenseTrade",
    title: "香火铺交易",
    body: "无灯的小铺只卖三样东西：香、纸、和不问来处的平安。",
    visualKey: "event-incense",
    choices: [
      { id: "buy", label: "买一炷清香", description: "获得一炷清香，铜钱 -8。", effects: { itemId: "qingxiang", coins: -8 } },
      { id: "swap", label: "用寿换钱", description: "铜钱 +18，阳寿 -1。", effects: { coins: 18, longevity: -1 } },
    ],
  },
  {
    id: "bailiff",
    title: "阴差盘问",
    body: "黑伞停在路中，伞下人翻着名册，要你报清今夜来意。",
    visualKey: "event-bailiff",
    choices: [
      { id: "honest", label: "据实相告", description: "阴德 +1，气运 +1。", effects: { virtue: 1, luck: 1 } },
      { id: "bribe", label: "塞些铜钱", description: "气运 +2，铜钱 -12。", effects: { luck: 2, coins: -12 } },
    ],
  },
  {
    id: "fox",
    title: "狐仙赌运",
    body: "红白衣影坐在屋脊，问你敢不敢把坏签也当好签用。",
    visualKey: "event-fox",
    choices: [
      { id: "bet", label: "赌一把", description: "气运 +3，阴德 -1。", effects: { luck: 3, virtue: -1 } },
      { id: "bow", label: "作揖谢过", description: "神力 +1，阴德 +1。", effects: { divine: 1, virtue: 1 } },
    ],
  },
  {
    id: "paperBoat",
    title: "河边纸船",
    body: "纸船顺着黑水漂来，船头立着一截没有点燃的命烛。",
    visualKey: "event-boat",
    choices: [
      { id: "light", label: "点燃命烛", description: "命数 +4，阳寿 -1。", effects: { life: 4, longevity: -1 } },
      { id: "send", label: "放船远去", description: "阴德 +2。", effects: { virtue: 2 } },
    ],
  },
];

export function createMapNodes(): MapNode[] {
  return [
    { id: "n1", type: "combat", label: "荒村夜路", enemyId: "youhun", completed: false },
    { id: "n2", type: "combat", label: "厉鬼哭巷", enemyId: "ligui", completed: false },
    { id: "n3", type: "event", label: "破庙求签", eventId: "qiantong", completed: false },
    { id: "n4", type: "combat", label: "狐灯屋脊", enemyId: "humei", completed: false },
    { id: "n5", type: "combat", label: "乱葬岗", enemyId: "shisha", completed: false },
    { id: "n6", type: "combat", label: "白绫槐下", enemyId: "diaosi", completed: false },
    { id: "n7", type: "elite", label: "破庙野仙", enemyId: "yexian", completed: false },
    { id: "n8", type: "shop", label: "寺庙商店", completed: false },
    { id: "n9", type: "event", label: "夜半借火", eventId: "lantern", completed: false },
    { id: "n10", type: "combat", label: "河边纸船", enemyId: "shuigui", completed: false },
    { id: "n11", type: "event", label: "神龛异响", eventId: "shrine", completed: false },
    { id: "n12", type: "combat", label: "阴债窄巷", enemyId: "taozhai", completed: false },
    { id: "n13", type: "elite", label: "尸王坟场", enemyId: "shiwang", completed: false },
    { id: "n14", type: "event", label: "狐仙赌运", eventId: "fox", completed: false },
    { id: "n15", type: "combat", label: "断香铺", enemyId: "xianghuozei", completed: false },
    { id: "n16", type: "boss", label: "太岁牌位", enemyId: "taisui", completed: false },
  ];
}
