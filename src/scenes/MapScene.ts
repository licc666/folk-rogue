import Phaser from "phaser";
import { BACKGROUNDS, nodeAssetTexture, textureOr } from "../game/assets";
import { currentNode, loadRun, saveRun } from "../game/state";
import { COLORS } from "../game/tokens";
import type { MapNode, RunState } from "../game/types";
import { addButton, addPanel, addSmoke, addStatsBar, announce, canAnimate, createStageBackground, pulse, reveal, textStyle, titleStyle } from "../game/ui";

export class MapScene extends Phaser.Scene {
  private run!: RunState;
  private mapContent?: Phaser.GameObjects.Container;
  private mapViewport?: Phaser.Geom.Rectangle;
  private mapScrollThumb?: Phaser.GameObjects.Rectangle;
  private mapLeftArrow?: Phaser.GameObjects.Container;
  private mapRightArrow?: Phaser.GameObjects.Container;
  private mapOffset = 0;
  private mapMinOffset = 0;
  private mapMaxOffset = 0;
  private mapScrollTrackWidth = 0;
  private mapScrollThumbWidth = 0;
  private mapDragging = false;
  private mapDragStartX = 0;
  private mapDragStartOffset = 0;
  private mapDragDistance = 0;
  private suppressMapNodeClick = false;
  private mapTween?: Phaser.Tweens.Tween;

  constructor() {
    super("MapScene");
  }

  create(): void {
    const run = loadRun();
    if (!run) {
      this.scene.start("MenuScene");
      return;
    }
    if (run.pendingReward) {
      this.scene.start("RewardScene");
      return;
    }
    this.run = run;
    createStageBackground(this, "跑局地图", BACKGROUNDS.village);
    addStatsBar(this, run);
    addSmoke(this);
    this.drawMap();

    addButton(this, 1120, 650, 160, 48, "回主菜单", () => {
      saveRun(this.run);
      this.scene.start("MenuScene");
    });

    this.input.keyboard?.on("keydown-ENTER", () => this.enterCurrentNode());
    this.input.keyboard?.on("keydown-SPACE", () => this.enterCurrentNode());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
      this.input.off("pointerdown", this.handleMapPointerDown);
      this.input.off("pointermove", this.handleMapPointerMove);
      this.input.off("pointerup", this.handleMapPointerUp);
      this.input.off("pointerupoutside", this.handleMapPointerUp);
      this.input.off("wheel", this.handleMapWheel);
    });
  }

  private drawMap(): void {
    const { width } = this.scale;
    const active = currentNode(this.run);
    this.add.text(90, 132, this.run.lastMessage, textStyle(18, COLORS.muted)).setWordWrapWidth(760);

    const viewportX = 74;
    const viewportY = 218;
    const viewportWidth = width - viewportX * 2;
    const viewportHeight = 298;
    const startX = 68;
    const gap = 136;
    const yBase = 148;
    const contentWidth = startX * 2 + gap * Math.max(0, this.run.nodes.length - 1);

    this.add
      .rectangle(width / 2, viewportY + viewportHeight / 2, viewportWidth + 26, viewportHeight + 22, COLORS.surface, 0.2)
      .setStrokeStyle(1, COLORS.goldDark, 0.42);

    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff, 1).fillRect(viewportX, viewportY, viewportWidth, viewportHeight);

    this.mapContent = this.add.container(viewportX, viewportY).setMask(maskShape.createGeometryMask());
    this.mapViewport = new Phaser.Geom.Rectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    this.mapMinOffset = Math.min(0, viewportWidth - contentWidth);
    this.mapMaxOffset = 0;

    const g = this.add.graphics();
    g.lineStyle(4, COLORS.goldDark, 0.75);
    for (let i = 0; i < this.run.nodes.length - 1; i += 1) {
      g.lineBetween(startX + i * gap, yBase + this.wave(i), startX + (i + 1) * gap, yBase + this.wave(i + 1));
    }
    this.mapContent.add(g);

    this.run.nodes.forEach((node, index) => {
      const x = startX + index * gap;
      const y = yBase + this.wave(index);
      this.drawNode(node, x, y, node.id === active.id);
    });

    this.drawMapScrollChrome(viewportX, viewportY, viewportWidth, viewportHeight);
    this.bindMapScroll();
    this.setMapOffset(Phaser.Math.Clamp(viewportWidth / 2 - (startX + this.run.currentNodeIndex * gap), this.mapMinOffset, this.mapMaxOffset));

    addPanel(this, width / 2, 585, 760, 86, 0.9);
    this.add.text(width / 2, 568, `当前：${active.label}`, titleStyle(24)).setOrigin(0.5);
    this.add.text(width / 2, 606, "点击发亮节点，或按 Enter / Space 进入。", textStyle(17, COLORS.muted)).setOrigin(0.5);
  }

  private drawNode(node: MapNode, x: number, y: number, active: boolean): void {
    const color = node.completed ? COLORS.good : active ? COLORS.primaryStrong : COLORS.surfaceStrong;
    const border = active ? COLORS.gold : COLORS.goldDark;
    const c = this.add.container(x, y).setSize(72, 72);
    const glow = this.add.circle(0, 0, 37, color, active ? 0.34 : 0.08).setStrokeStyle(2, border, active ? 0.95 : 0.42);
    const icon = this.add.image(0, 0, this.nodeTexture(node)).setDisplaySize(62, 62).setAlpha(active || node.completed ? 1 : 0.68);
    const label = this.add.text(0, 48, node.label, textStyle(13, active ? COLORS.text : COLORS.muted, { align: "center" })).setOrigin(0.5);
    label.setWordWrapWidth(86);
    c.add([glow, icon, label]);
    this.mapContent?.add(c);
    reveal(this, c, y + 12, y);
    if (active && !node.completed) {
      pulse(this, glow, 1.12, 980);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1.04, duration: 140, ease: "Sine.easeOut" });
      });
      c.on("pointerout", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1, duration: 140, ease: "Sine.easeOut" });
        else c.setScale(1);
      });
      c.on("pointerdown", () => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 0.96, duration: 80, ease: "Sine.easeOut" });
        else c.setScale(0.97);
      });
      c.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1, duration: 120, ease: "Back.easeOut" });
        else c.setScale(1);
        if (this.suppressMapNodeClick || !this.isPointerInMapViewport(pointer)) return;
        this.enterCurrentNode();
      });
    }
  }

  private drawMapScrollChrome(x: number, y: number, width: number, height: number): void {
    const trackWidth = Math.min(540, width - 240);
    const trackY = y + height + 19;
    this.mapScrollTrackWidth = trackWidth;
    this.mapScrollThumbWidth = Math.max(74, Math.min(trackWidth, (width / Math.max(width, width - this.mapMinOffset)) * trackWidth));
    this.add.rectangle(this.scale.width / 2, trackY, trackWidth, 4, COLORS.goldDark, 0.34);
    this.mapScrollThumb = this.add
      .rectangle(this.scale.width / 2, trackY, this.mapScrollThumbWidth, 6, COLORS.gold, 0.88)
      .setStrokeStyle(1, COLORS.gold, 0.35);
    this.mapLeftArrow = this.drawMapArrow(x + 24, y + height / 2, "‹", 1);
    this.mapRightArrow = this.drawMapArrow(x + width - 24, y + height / 2, "›", -1);
  }

  private drawMapArrow(x: number, y: number, glyph: string, direction: number): Phaser.GameObjects.Container {
    const bg = this.add.circle(0, 0, 23, COLORS.surfaceStrong, 0.86).setStrokeStyle(2, COLORS.goldDark, 0.9);
    const label = this.add.text(0, -3, glyph, titleStyle(34)).setOrigin(0.5);
    const c = this.add.container(x, y, [bg, label]).setSize(46, 46).setDepth(12);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => {
      bg.setStrokeStyle(2, COLORS.gold, 1);
      if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1.06, duration: 120, ease: "Sine.easeOut" });
    });
    c.on("pointerout", () => {
      bg.setStrokeStyle(2, COLORS.goldDark, 0.9);
      if (canAnimate(this)) this.tweens.add({ targets: c, scale: 1, duration: 120, ease: "Sine.easeOut" });
      else c.setScale(1);
    });
    c.on("pointerup", () => {
      this.setMapOffset(this.mapOffset + direction * 520, true);
    });
    return c;
  }

  private bindMapScroll(): void {
    this.input.off("pointerdown", this.handleMapPointerDown);
    this.input.off("pointermove", this.handleMapPointerMove);
    this.input.off("pointerup", this.handleMapPointerUp);
    this.input.off("pointerupoutside", this.handleMapPointerUp);
    this.input.off("wheel", this.handleMapWheel);
    this.input.on("pointerdown", this.handleMapPointerDown);
    this.input.on("pointermove", this.handleMapPointerMove);
    this.input.on("pointerup", this.handleMapPointerUp);
    this.input.on("pointerupoutside", this.handleMapPointerUp);
    this.input.on("wheel", this.handleMapWheel);
  }

  private handleMapPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.isPointerInMapViewport(pointer)) return;
    this.mapTween?.stop();
    this.mapDragging = true;
    this.mapDragStartX = pointer.x;
    this.mapDragStartOffset = this.mapOffset;
    this.mapDragDistance = 0;
    this.suppressMapNodeClick = false;
  };

  private handleMapPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.mapDragging) return;
    const delta = pointer.x - this.mapDragStartX;
    this.mapDragDistance = Math.max(this.mapDragDistance, Math.abs(delta));
    if (this.mapDragDistance > 6) this.suppressMapNodeClick = true;
    this.setMapOffset(this.mapDragStartOffset + delta);
  };

  private handleMapPointerUp = (): void => {
    if (!this.mapDragging) return;
    this.mapDragging = false;
    if (this.mapDragDistance > 6) {
      this.suppressMapNodeClick = true;
      this.time.delayedCall(90, () => {
        this.suppressMapNodeClick = false;
      });
      return;
    }
    this.suppressMapNodeClick = false;
  };

  private handleMapWheel = (
    pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    deltaX: number,
    deltaY: number,
    _deltaZ: number,
    event?: WheelEvent,
  ): void => {
    if (!this.isPointerInMapViewport(pointer)) return;
    event?.preventDefault();
    this.setMapOffset(this.mapOffset - (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY) * 0.75);
  };

  private isPointerInMapViewport(pointer: Phaser.Input.Pointer): boolean {
    return Boolean(this.mapViewport?.contains(pointer.x, pointer.y));
  }

  private setMapOffset(offset: number, animate = false): void {
    const next = Phaser.Math.Clamp(offset, this.mapMinOffset, this.mapMaxOffset);
    this.mapOffset = next;
    if (!this.mapContent || !this.mapViewport) return;
    const targetX = this.mapViewport.x + next;
    if (animate && canAnimate(this)) {
      this.mapTween?.stop();
      this.mapTween = this.tweens.add({
        targets: this.mapContent,
        x: targetX,
        duration: 260,
        ease: "Cubic.easeOut",
        onUpdate: () => {
          if (!this.mapContent || !this.mapViewport) return;
          this.mapOffset = this.mapContent.x - this.mapViewport.x;
          this.updateMapScrollChrome();
        },
      });
      return;
    }
    this.mapContent.x = targetX;
    this.updateMapScrollChrome();
  }

  private updateMapScrollChrome(): void {
    const denominator = this.mapMinOffset - this.mapMaxOffset;
    const progress = denominator === 0 ? 0 : Phaser.Math.Clamp((this.mapOffset - this.mapMaxOffset) / denominator, 0, 1);
    if (this.mapScrollThumb) {
      this.mapScrollThumb.x =
        this.scale.width / 2 - this.mapScrollTrackWidth / 2 + this.mapScrollThumbWidth / 2 + progress * (this.mapScrollTrackWidth - this.mapScrollThumbWidth);
    }
    this.mapLeftArrow?.setAlpha(this.mapOffset < this.mapMaxOffset - 1 ? 0.92 : 0.34);
    this.mapRightArrow?.setAlpha(this.mapOffset > this.mapMinOffset + 1 ? 0.92 : 0.34);
  }

  private nodeTexture(node: MapNode): string {
    if (node.type === "combat") return textureOr(this, nodeAssetTexture("combat"), "node-combat");
    if (node.type === "elite") return textureOr(this, nodeAssetTexture("elite"), "node-elite");
    if (node.type === "event") return textureOr(this, nodeAssetTexture("event"), "node-event");
    if (node.type === "shop") return textureOr(this, nodeAssetTexture("shop"), "node-shop");
    return textureOr(this, nodeAssetTexture("boss"), "node-boss");
  }

  private wave(index: number): number {
    return Math.sin(index * 0.9) * 58;
  }

  private enterCurrentNode(): void {
    const node = currentNode(this.run);
    announce(`进入${node.label}`);
    if (node.type === "combat" || node.type === "elite" || node.type === "boss") this.scene.start("CombatScene", { enemyId: node.enemyId });
    if (node.type === "event") this.scene.start("EventScene", { eventId: node.eventId });
    if (node.type === "shop") this.scene.start("ShopScene");
  }
}
