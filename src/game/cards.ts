import { COLORS } from "./tokens";
import type { CardConfig } from "./types";

export interface CardPalette {
  fill: number;
  border: number;
  label: string;
  typeName: string;
}

export function cardPalette(card: CardConfig): CardPalette {
  if (card.damage && !card.block && !card.heal) {
    return { fill: 0xf4c38f, border: COLORS.primaryStrong, label: "攻", typeName: "攻击符" };
  }
  if (card.block && !card.damage) {
    return { fill: 0xd7e8c8, border: COLORS.good, label: "御", typeName: "护身符" };
  }
  if (card.divine || card.draw || card.heal) {
    return { fill: 0xcce4e8, border: COLORS.spirit, label: "气", typeName: "资源符" };
  }
  return { fill: 0xe8d29a, border: COLORS.gold, label: "异", typeName: "特殊符" };
}
