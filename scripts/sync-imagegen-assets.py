#!/usr/bin/env python3
from __future__ import annotations

import binascii
import shutil
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "output" / "imagegen"
ASSET_DIR = ROOT / "public" / "assets"

ASSETS = [
    ("21-1_001_hero_folk-daoist.png", "characters/hero-folk-daoist.png", True),
    ("21-1_002_bg_deserted-village-road.png", "backgrounds/deserted-village-road.png", False),
    ("21-1_003_bg_ruined-temple-interior.png", "backgrounds/ruined-temple-interior.png", False),
    ("21-1_004_bg_mass-graveyard.png", "backgrounds/mass-graveyard.png", False),
    ("21-1_005_bg_chenghuang-underworld-hall.png", "backgrounds/chenghuang-underworld-hall.png", False),
    ("21-1_006_enemy_youhun.png", "enemies/youhun.png", True),
    ("21-1_007_enemy_shisha.png", "enemies/shisha.png", True),
    ("21-1_008_enemy_humei.png", "enemies/humei.png", True),
    ("21-1_009_enemy_taozhai.png", "enemies/taozhai.png", True),
    ("21-1_010_god_guandi.png", "gods/guandi.png", True),
    ("21-1_011_god_leigong.png", "gods/leigong.png", True),
    ("21-1_012_god_caishen.png", "gods/caishen.png", True),
    ("21-1_013_god_tudi.png", "gods/tudi.png", True),
    ("21-1_014_god_chenghuang.png", "gods/chenghuang.png", True),
    ("21-1_015_god_huxian.png", "gods/huxian.png", True),
    ("21-1_016_card_zhenxie.png", "cards/zhenxie.png", False),
    ("21-1_017_card_leihuo.png", "cards/leihuo.png", False),
    ("21-1_018_card_posha.png", "cards/posha.png", False),
    ("21-1_019_card_xuefu.png", "cards/xuefu.png", False),
    ("21-1_020_card_zhuanyun.png", "cards/zhuanyun.png", False),
    ("21-1_021_card_qingshen.png", "cards/qingshen.png", False),
    ("21-1_022_card_tishen.png", "cards/tishen.png", False),
    ("21-1_023_card_chaodu.png", "cards/chaodu.png", False),
    ("21-1_024_card_juqi.png", "cards/juqi.png", False),
    ("21-1_025_card_jieming.png", "cards/jieming.png", False),
    ("21-1_026_card_yinguo.png", "cards/yinguo.png", False),
    ("21-1_027_card_quhui.png", "cards/quhui.png", False),
    ("21-1_028_item_taomu-sword.png", "items/taomu.png", True),
    ("21-1_029_item_bagua-sword.png", "items/bagua.png", True),
    ("21-1_030_item_leijimu.png", "items/leijimu.png", True),
    ("21-1_031_item_yuxi.png", "items/yuxi.png", True),
    ("21-1_032_item_xiangnang.png", "items/xiangnang.png", True),
    ("21-1_033_item_pingankou.png", "items/pingankou.png", True),
    ("21-1_034_item_zhiren.png", "items/zhiren.png", True),
    ("21-1_035_item_hushenyu.png", "items/hushenyu.png", True),
    ("21-1_036_item_qingxiang.png", "items/qingxiang.png", True),
    ("21-1_037_item_gaoxiang.png", "items/gaoxiang.png", True),
    ("21-1_038_item_huanyuan-pai.png", "items/huanyuan.png", True),
    ("21-1_039_item_gongdexiang.png", "items/gongdexiang.png", True),
    ("21-1_040_item_jiemingdeng.png", "items/jiemingdeng.png", True),
    ("21-1_041_item_yinqiandai.png", "items/yinqiandai.png", True),
    ("21-1_042_item_xuefushu.png", "items/xuefushu.png", True),
    ("21-1_043_item_heimu-statue.png", "items/heimu.png", True),
    ("21-1_044_stat_life.png", "stats/life.png", True),
    ("21-1_045_stat_divine.png", "stats/divine.png", True),
    ("21-1_046_stat_longevity.png", "stats/longevity.png", True),
    ("21-1_047_stat_virtue.png", "stats/virtue.png", True),
    ("21-1_048_stat_luck.png", "stats/luck.png", True),
    ("21-2_001_hero_combat-casting.png", "characters/hero-combat-casting.png", True),
    ("21-2_002_hero_hit-variant.png", "characters/hero-hit-variant.png", True),
    ("21-2_003_enemy_ligui.png", "enemies/ligui.png", True),
    ("21-2_004_enemy_shuigui.png", "enemies/shuigui.png", True),
    ("21-2_005_enemy_diaosi.png", "enemies/diaosi.png", True),
    ("21-2_006_enemy_xianghuozei.png", "enemies/xianghuozei.png", True),
    ("21-2_007_enemy_yexian.png", "enemies/yexian.png", True),
    ("21-2_008_enemy_shiwang.png", "enemies/shiwang.png", True),
    ("21-2_009_boss_taisui.png", "enemies/taisui.png", True),
    ("21-2_010_ui_coin.png", "ui/coin.png", True),
    ("21-2_011_ui_incense.png", "ui/incense.png", True),
    ("21-2_012_ui_button-primary-sheet.png", "ui/button-primary-sheet.png", True),
    ("21-2_013_ui_button-secondary-sheet.png", "ui/button-secondary-sheet.png", True),
    ("21-2_014_ui_button-danger-sheet.png", "ui/button-danger-sheet.png", True),
    ("21-2_015_ui_panel-paper-frame.png", "ui/panel-paper-frame.png", True),
    ("21-2_016_ui_panel-temple-frame.png", "ui/panel-temple-frame.png", True),
    ("21-2_017_ui_panel-underworld-frame.png", "ui/panel-underworld-frame.png", True),
    ("21-2_018_node_combat.png", "nodes/combat.png", True),
    ("21-2_019_node_elite.png", "nodes/elite.png", True),
    ("21-2_020_node_event.png", "nodes/event.png", True),
    ("21-2_021_node_shop.png", "nodes/shop.png", True),
    ("21-2_022_node_boss.png", "nodes/boss.png", True),
    ("21-2_023_omen_great.png", "omens/great.png", True),
    ("21-2_024_omen_middle.png", "omens/middle.png", True),
    ("21-2_025_omen_small.png", "omens/small.png", True),
    ("21-2_026_omen_minor-bad.png", "omens/minor-bad.png", True),
    ("21-2_027_omen_great-bad.png", "omens/great-bad.png", True),
    ("21-2_028_shopkeeper_faceless-paper.png", "characters/shopkeeper-faceless-paper.png", True),
    ("21-2_029_event_qiantong.png", "events/qiantong.png", False),
    ("21-2_030_event_debt.png", "events/debt.png", False),
    ("21-2_031_event_huanyuan.png", "events/huanyuan.png", False),
    ("21-2_032_event_shrine.png", "events/shrine.png", False),
    ("21-2_033_event_lantern.png", "events/lantern.png", False),
    ("21-2_034_event_grave.png", "events/grave.png", False),
    ("21-2_035_event_incense.png", "events/incense.png", False),
    ("21-2_036_event_bailiff.png", "events/bailiff.png", False),
    ("21-2_037_event_fox.png", "events/fox.png", False),
    ("21-2_038_event_boat.png", "events/boat.png", False),
    ("21-2_039_fx_fuhuo-sheet.png", "fx/fuhuo-sheet.png", True),
    ("21-2_040_fx_lightning-sheet.png", "fx/lightning-sheet.png", True),
    ("21-2_041_fx_smoke-sheet.png", "fx/smoke-sheet.png", True),
    ("21-2_042_fx_incense-smoke-sheet.png", "fx/incense-smoke-sheet.png", True),
    ("21-2_043_fx_paper-money-sheet.png", "fx/paper-money-sheet.png", True),
    ("21-2_044_fx_barrier-sheet.png", "fx/barrier-sheet.png", True),
    ("21-2_045_fx_critical-flash-sheet.png", "fx/critical-flash-sheet.png", True),
    ("21-3_001_digits_damage-red.png", "combat-text/digits-damage-red.png", True),
    ("21-3_002_digits_damage-critical.png", "combat-text/digits-damage-critical.png", True),
    ("21-3_003_digits_shield-gold.png", "combat-text/digits-shield-gold.png", True),
    ("21-3_004_digits_heal-green.png", "combat-text/digits-heal-green.png", True),
    ("21-3_005_digits_spirit-blue.png", "combat-text/digits-spirit-blue.png", True),
    ("21-3_006_digits_luck-gold.png", "combat-text/digits-luck-gold.png", True),
    ("21-3_007_digits_neutral-muted.png", "combat-text/digits-neutral-muted.png", True),
    ("21-3_008_symbols_combat.png", "combat-text/symbols-combat.png", True),
    ("21-3_009_text_damage.png", "combat-text/text-damage.png", True),
    ("21-3_010_text_break-shield.png", "combat-text/text-break-shield.png", True),
    ("21-3_011_text_guard.png", "combat-text/text-guard.png", True),
    ("21-3_012_text_life.png", "combat-text/text-life.png", True),
    ("21-3_013_text_divine.png", "combat-text/text-divine.png", True),
    ("21-3_014_text_luck.png", "combat-text/text-luck.png", True),
    ("21-3_015_text_virtue.png", "combat-text/text-virtue.png", True),
    ("21-3_016_text_draw-card.png", "combat-text/text-draw-card.png", True),
    ("21-3_017_text_invalid.png", "combat-text/text-invalid.png", True),
    ("21-3_018_text_cast-success.png", "combat-text/text-cast-success.png", True),
    ("21-3_019_text_calamity.png", "combat-text/text-calamity.png", True),
    ("21-3_020_text_charge.png", "combat-text/text-charge.png", True),
    ("21-3_021_text_curse.png", "combat-text/text-curse.png", True),
    ("21-3_022_text_omen-great.png", "combat-text/text-omen-great.png", True),
    ("21-3_023_text_omen-middle.png", "combat-text/text-omen-middle.png", True),
    ("21-3_024_text_omen-small.png", "combat-text/text-omen-small.png", True),
    ("21-3_025_text_omen-minor-bad.png", "combat-text/text-omen-minor-bad.png", True),
    ("21-3_026_text_omen-great-bad.png", "combat-text/text-omen-great-bad.png", True),
    ("21-3_027_pop_damage-backplate.png", "combat-text/pop-damage-backplate.png", True),
    ("21-3_028_pop_shield-backplate.png", "combat-text/pop-shield-backplate.png", True),
    ("21-3_029_pop_heal-backplate.png", "combat-text/pop-heal-backplate.png", True),
    ("21-3_030_pop_spirit-backplate.png", "combat-text/pop-spirit-backplate.png", True),
    ("21-3_031_pop_luck-backplate.png", "combat-text/pop-luck-backplate.png", True),
]


def read_png(path: Path) -> tuple[int, int, int, list[bytearray]]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG: {path}")

    chunks: list[tuple[bytes, bytes]] = []
    offset = 8
    while offset < len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        chunk_data = data[offset + 8 : offset + 8 + length]
        chunks.append((chunk_type, chunk_data))
        offset += length + 12
        if chunk_type == b"IEND":
            break

    ihdr = next(chunk for chunk_type, chunk in chunks if chunk_type == b"IHDR")
    width, height, bit_depth, color_type, _compression, _filter, interlace = struct.unpack(">IIBBBBB", ihdr)
    if bit_depth != 8 or color_type not in (2, 6) or interlace != 0:
        raise ValueError(f"Unsupported PNG format: {path}")

    channels = 4 if color_type == 6 else 3
    stride = width * channels
    raw = zlib.decompress(b"".join(chunk for chunk_type, chunk in chunks if chunk_type == b"IDAT"))
    rows: list[bytearray] = []
    previous = bytearray(stride)
    cursor = 0

    for _row_index in range(height):
        filter_type = raw[cursor]
        cursor += 1
        row = bytearray(raw[cursor : cursor + stride])
        cursor += stride

        for index in range(stride):
            left = row[index - channels] if index >= channels else 0
            up = previous[index]
            up_left = previous[index - channels] if index >= channels else 0
            if filter_type == 1:
                row[index] = (row[index] + left) & 255
            elif filter_type == 2:
                row[index] = (row[index] + up) & 255
            elif filter_type == 3:
                row[index] = (row[index] + ((left + up) >> 1)) & 255
            elif filter_type == 4:
                predictor = left + up - up_left
                distances = (abs(predictor - left), abs(predictor - up), abs(predictor - up_left))
                paeth = left if distances[0] <= distances[1] and distances[0] <= distances[2] else up if distances[1] <= distances[2] else up_left
                row[index] = (row[index] + paeth) & 255
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter {filter_type}: {path}")

        rows.append(row)
        previous = row

    return width, height, channels, rows


def png_chunk(chunk_type: bytes, chunk_data: bytes) -> bytes:
    crc = binascii.crc32(chunk_type + chunk_data) & 0xFFFFFFFF
    return struct.pack(">I", len(chunk_data)) + chunk_type + chunk_data + struct.pack(">I", crc)


def write_rgba_png(path: Path, width: int, height: int, rows: list[bytearray]) -> None:
    raw = bytearray()
    for row in rows:
        raw.append(0)
        raw.extend(row)

    path.parent.mkdir(parents=True, exist_ok=True)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + png_chunk(b"IEND", b"")
    )


def should_key_out(red: int, green: int, blue: int) -> bool:
    return red >= 205 and blue >= 205 and green <= 105 and abs(red - blue) <= 55


def chroma_to_alpha(source: Path, destination: Path) -> None:
    width, height, channels, rows = read_png(source)
    rgba_rows: list[bytearray] = []
    for row in rows:
        rgba = bytearray(width * 4)
        for pixel in range(width):
            source_index = pixel * channels
            red, green, blue = row[source_index], row[source_index + 1], row[source_index + 2]
            alpha = row[source_index + 3] if channels == 4 else 255
            if should_key_out(red, green, blue):
                alpha = 0
            target_index = pixel * 4
            rgba[target_index : target_index + 4] = bytes((red, green, blue, alpha))
        rgba_rows.append(rgba)
    write_rgba_png(destination, width, height, rgba_rows)


def main() -> None:
    synced = 0
    skipped = 0
    for source_name, destination_name, needs_alpha in ASSETS:
        source = SOURCE_DIR / source_name
        destination = ASSET_DIR / destination_name
        if not source.exists():
            raise FileNotFoundError(source)
        if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
            skipped += 1
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        if needs_alpha:
            chroma_to_alpha(source, destination)
        else:
            shutil.copy2(source, destination)
        synced += 1
    print(f"Synced {synced} assets to {ASSET_DIR.relative_to(ROOT)} ({skipped} already current)")


if __name__ == "__main__":
    main()
