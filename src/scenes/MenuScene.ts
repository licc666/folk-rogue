import Phaser from "phaser";
import { BACKGROUNDS } from "../game/assets";
import { createNewRun, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import { addButton, addSmoke, announce, createStageBackground, pulse, reveal, textStyle, titleStyle, wrapText } from "../game/ui";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    createStageBackground(this, undefined, BACKGROUNDS.temple);
    addSmoke(this);
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, 130, "民间 Rogue", titleStyle(58)).setOrigin(0.5);
    reveal(this, title, 148, 130);
    pulse(this, title, 1.025, 1500);
    const subtitle = this.add.text(width / 2, 194, "纸扎戏台里的抽签、请神与因果构筑", textStyle(20, COLORS.muted)).setOrigin(0.5);
    reveal(this, subtitle, 210, 194);

    const intro = this.add.text(
      width / 2,
      278,
      "一局 20 分钟的志怪跑局竖切版。抽签定本回合运势，用符纸与神明改写坏签，活着走到太岁牌位前。",
      textStyle(21, COLORS.text, { align: "center" }),
    ).setOrigin(0.5);
    wrapText(intro, 720);
    reveal(this, intro, 294, 278);

    addButton(this, width / 2, 405, 250, 58, "开始跑局", () => {
      const run = createNewRun();
      saveRun(run);
      announce("新跑局开始。");
      this.scene.start("MapScene");
    }, { primary: true, aria: "开始新的跑局" });

    addButton(this, width / 2, 482, 250, 58, "继续游戏", () => {
      if (!loadRun()) saveRun(createNewRun());
      announce("继续当前跑局。");
      this.scene.start("MapScene");
    }, { disabled: !loadRun(), aria: "继续已保存的跑局" });

    addButton(this, width / 2, 559, 250, 58, "键位说明", () => {
      this.showKeys();
    }, { aria: "查看键位说明" });

    this.input.keyboard?.once("keydown-ENTER", () => {
      const run = createNewRun();
      saveRun(run);
      this.scene.start("MapScene");
    });
  }

  private showKeys(): void {
    const { width, height } = this.scale;
    const panel = this.add.rectangle(width / 2, height / 2, 600, 240, COLORS.surface, 0.98).setStrokeStyle(2, COLORS.gold);
    const title = this.add.text(width / 2, height / 2 - 78, "键位", titleStyle(28)).setOrigin(0.5);
    const body = this.add.text(
      width / 2,
      height / 2 + 16,
      "Enter / Space：确认\nEsc：返回地图或菜单\n数字 1-5：战斗中选择手牌\n点击：选择节点、符纸、事件与商店项目",
      textStyle(20, COLORS.text, { align: "center" }),
    ).setOrigin(0.5);
    const close = addButton(this, width / 2, height / 2 + 92, 140, 48, "知道了", () => {
      panel.destroy();
      title.destroy();
      body.destroy();
      close.destroy();
    }, { primary: true });
    reveal(this, panel, height / 2 + 16, height / 2);
    reveal(this, title, height / 2 - 62, height / 2 - 78);
    reveal(this, body, height / 2 + 30, height / 2 + 16);
  }
}
