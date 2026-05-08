import Phaser from "phaser";
import { BACKGROUNDS } from "../game/assets";
import { clearRun, createNewRun, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import { addButton, addPanel, addSmoke, createStageBackground, flashAt, pulse, reveal, textStyle, titleStyle } from "../game/ui";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create(data: { result?: "win" | "lose"; message?: string }): void {
    const run = loadRun();
    const result = data.result ?? run?.result ?? "lose";
    const win = result === "win";
    createStageBackground(this, undefined, win ? BACKGROUNDS.underworld : BACKGROUNDS.graveyard);
    addSmoke(this);
    const { width, height } = this.scale;
    const panel = addPanel(this, width / 2, height / 2, 780, 430, 0.94);
    reveal(this, panel, height / 2 + 26, height / 2);
    const title = this.add.text(width / 2, 208, win ? "太岁劫破" : "命灯暂熄", titleStyle(44)).setOrigin(0.5);
    title.setColor(`#${(win ? COLORS.good : COLORS.primaryStrong).toString(16).padStart(6, "0")}`);
    reveal(this, title, 228, 208);
    pulse(this, title, 1.035, 1200);
    flashAt(this, width / 2, 238, win ? COLORS.good : COLORS.primaryStrong, 180);
    const message = this.add.text(
      width / 2,
      292,
      data.message ?? (win ? "香灰落定，你从牌位前活着走回人间。" : "符火渐灭，因果仍在账上。"),
      textStyle(22, win ? COLORS.good : COLORS.muted, { align: "center" }),
    ).setOrigin(0.5).setWordWrapWidth(620);
    reveal(this, message, 310, 292);
    if (run) {
      const stats = this.add.text(
        width / 2,
        374,
        `命数 ${run.stats.life}/${run.stats.maxLife} · 阳寿 ${run.stats.longevity} · 阴德 ${run.stats.virtue} · 气运 ${run.stats.luck} · 铜钱 ${run.coins}`,
        textStyle(18, COLORS.text, { align: "center" }),
      ).setOrigin(0.5).setWordWrapWidth(680);
      reveal(this, stats, 390, 374);
    }
    addButton(this, width / 2 - 130, 498, 210, 56, "再开一局", () => {
      saveRun(createNewRun());
      this.scene.start("MapScene");
    }, { primary: true });
    addButton(this, width / 2 + 130, 498, 210, 56, "回主菜单", () => {
      clearRun();
      this.scene.start("MenuScene");
    });
  }
}
