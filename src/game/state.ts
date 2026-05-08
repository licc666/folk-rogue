import { createMapNodes, INITIAL_DECK, INITIAL_STATS } from "./data";
import { SAVE_KEY } from "./tokens";
import type { RunState } from "./types";

export function createNewRun(): RunState {
  return {
    stats: { ...INITIAL_STATS },
    coins: 30,
    deck: [...INITIAL_DECK],
    items: [],
    gods: ["guandi"],
    currentNodeIndex: 0,
    nodes: createMapNodes(),
    completedNodes: [],
    lastMessage: "香火初燃，命灯未灭。",
  };
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunState;
    if (!parsed.stats || !Array.isArray(parsed.deck) || !Array.isArray(parsed.nodes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRun(run: RunState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(run));
}

export function clearRun(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function clampRun(run: RunState): RunState {
  run.stats.life = Math.max(0, Math.min(run.stats.maxLife, run.stats.life));
  run.stats.divine = Math.max(0, run.stats.divine);
  run.stats.longevity = Math.max(0, run.stats.longevity);
  run.coins = Math.max(0, run.coins);
  return run;
}

export function currentNode(run: RunState) {
  return run.nodes[run.currentNodeIndex];
}

export function completeCurrentNode(run: RunState, message: string): RunState {
  const node = currentNode(run);
  node.completed = true;
  run.completedNodes.push(node.id);
  run.currentNodeIndex = Math.min(run.currentNodeIndex + 1, run.nodes.length - 1);
  run.lastMessage = message;
  saveRun(run);
  return run;
}
