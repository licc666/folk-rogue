import Phaser from "phaser";
import { BACKGROUNDS, fxTexture, itemTexture, textureOr } from "../game/assets";
import { ITEMS } from "../game/data";
import { applyItem } from "../game/rules";
import { clampRun, completeCurrentNode, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import type { ItemConfig, RunState } from "../game/types";
import { addButton, addPanel, addSmoke, addStatsBar, createStageBackground, particleBurst, pulse, reveal, textStyle, titleStyle, wrapText } from "../game/ui";

export class ShopScene extends Phaser.Scene {
  private run!: RunState;
  private stock: ItemConfig[] = [];

  constructor() {
    super("ShopScene");
  }

  create(): void {
    const run = loadRun();
    if (!run) {
      this.scene.start("MenuScene");
      return;
    }
    this.run = run;
    this.stock = this.pickStock();
    createStageBackground(this, "寺庙商店", BACKGROUNDS.temple);
    addStatsBar(this, run);
    addSmoke(this);
    this.drawShop();
    this.input.keyboard?.on("keydown-ESC", () => this.leave("未作交易，离开寺庙。"));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  private pickStock(): ItemConfig[] {
    const pool = this.run.stats.luck >= 2
      ? ["taomu", "bagua", "leijimu", "yuxi", "xiangnang", "pingankou", "zhiren", "hushenyu", "qingxiang", "gaoxiang", "huanyuan", "gongdexiang", "jiemingdeng", "yinqiandai", "xuefushu", "heimu"]
      : ["taomu", "xiangnang", "pingankou", "qingxiang", "gaoxiang", "huanyuan", "jiemingdeng", "yinqiandai", "xuefushu", "heimu"];
    const karma = this.run.stats.virtue < 0 ? ["yinqiandai", "xuefushu", "heimu"] : [];
    const ids = [...new Set([...karma, ...pool])].slice(0, 8);
    return ids.map((id) => ITEMS.find((item) => item.id === id)!).filter(Boolean);
  }

  private drawShop(message = "庙祝垂眼不语，只把价码推到香灰前。"): void {
    this.children.removeAll(true);
    createStageBackground(this, "寺庙商店", BACKGROUNDS.temple);
    addStatsBar(this, this.run);
    const { width } = this.scale;
    addPanel(this, width / 2, 388, 940, 430, 0.94);
    const shopText = this.add.text(width / 2, 190, message, textStyle(20, COLORS.muted, { align: "center" })).setOrigin(0.5);
    reveal(this, shopText, 204, 190);
    const keeper = this.add.image(186, 410, "shopkeeper").setDisplaySize(148, 222);
    reveal(this, keeper, 432, 410);
    pulse(this, keeper, 1.025, 1800);
    this.add.text(186, 548, "无面纸人店主", textStyle(17, COLORS.muted)).setOrigin(0.5);

    this.stock.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = width / 2 - 128 + col * 420;
      const y = 252 + row * 92;
      this.drawItem(item, x, y);
    });

    addButton(this, width / 2, 635, 220, 54, "离开寺庙", () => this.leave("香火渐远，继续上路。"), { primary: true });
  }

  private drawItem(item: ItemConfig, x: number, y: number): void {
    const panel = addPanel(this, x, y, 390, 76, 0.88);
    reveal(this, panel, y + 18, y);
    const icon = this.add.image(x - 158, y, textureOr(this, itemTexture(item.id), "icon-token")).setDisplaySize(52, 52);
    reveal(this, icon, y + 18, y);
    pulse(this, icon, 1.06, 1300);
    const title = this.add.text(x - 122, y - 28, `${item.name} · ${item.price} 钱`, titleStyle(18));
    reveal(this, title, y - 18, y - 32);
    const desc = this.add.text(x - 122, y - 2, item.description, textStyle(14, COLORS.muted));
    wrapText(desc, 228);
    reveal(this, desc, y + 10, y - 4);
    addButton(this, x + 138, y + 14, 82, 44, "购买", () => this.buy(item), {
      disabled: this.run.coins < item.price,
      aria: `购买${item.name}`,
    });
  }

  private buy(item: ItemConfig): void {
    if (this.run.coins < item.price) return;
    this.run.coins -= item.price;
    if (!this.run.items.includes(item.id)) this.run.items.push(item.id);
    const message = applyItem(this.run, item);
    const paperFx = textureOr(this, fxTexture("paper-money"), "particle-paper");
    particleBurst(this, this.scale.width / 2, 420, paperFx, {
      count: 10,
      color: COLORS.gold,
      spread: 80,
      rise: 70,
      ...(this.textures.exists(fxTexture("paper-money")) ? { frameStart: 0, frameEnd: 7 } : {}),
    });
    clampRun(this.run);
    saveRun(this.run);
    this.stock = this.stock.filter((entry) => entry.id !== item.id);
    this.drawShop(message);
  }

  private leave(message: string): void {
    completeCurrentNode(this.run, message);
    saveRun(this.run);
    this.scene.start("MapScene");
  }
}
