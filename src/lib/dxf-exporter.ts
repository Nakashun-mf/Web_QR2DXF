import type { QRMatrix } from "./qr-generator";

interface DXFOptions {
  dotSizeMm: number;
  /** ハッチング線のピッチ(mm)。刻印工具の線幅相当を指定すると隙間なく塗れる */
  hatchPitchMm?: number;
  layerName?: string;
  originX?: number;
  originY?: number;
}

const EOL = "\r\n";

function row(groupCode: number | string, value: string | number): string {
  return `${groupCode}${EOL}${value}${EOL}`;
}

// 1本の直線(LINE)エンティティ。塗りつぶし(SOLID)を使わず線ストロークで描画する。
function lineEntity(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  layer: string
): string {
  return (
    row(0, "LINE") +
    row(8, layer) +
    row(62, 256) +
    row(10, x1.toFixed(4)) +
    row(20, y1.toFixed(4)) +
    row(30, "0.0000") +
    row(11, x2.toFixed(4)) +
    row(21, y2.toFixed(4)) +
    row(31, "0.0000")
  );
}

// R12 (AC1009) を採用。R12 はハンドル・BLOCK_RECORD テーブル・OBJECTS
// セクションを必要としない最も互換性の高い DXF 形式で、刻印機や各種 CAD が
// 確実に読み込める。AC1015 を名乗りつつ必須構造を欠いていたため
// 「破損して開けない」状態になっていた。
function headerSection(): string {
  return (
    row(0, "SECTION") +
    row(2, "HEADER") +
    row(9, "$ACADVER") +
    row(1, "AC1009") +
    row(9, "$INSUNITS") +
    row(70, 4) +
    row(0, "ENDSEC")
  );
}

function tablesSection(layerName: string): string {
  return (
    row(0, "SECTION") +
    row(2, "TABLES") +
    // LTYPE table
    row(0, "TABLE") +
    row(2, "LTYPE") +
    row(70, 1) +
    row(0, "LTYPE") +
    row(2, "CONTINUOUS") +
    row(70, 0) +
    row(3, "Solid line") +
    row(72, 65) +
    row(73, 0) +
    row(40, "0.0") +
    row(0, "ENDTAB") +
    // LAYER table
    row(0, "TABLE") +
    row(2, "LAYER") +
    row(70, 1) +
    row(0, "LAYER") +
    row(2, layerName) +
    row(70, 0) +
    row(62, 7) +
    row(6, "CONTINUOUS") +
    row(0, "ENDTAB") +
    row(0, "ENDSEC")
  );
}

export function exportToDXF(matrix: QRMatrix, options: DXFOptions): string {
  const {
    dotSizeMm,
    hatchPitchMm,
    layerName = "QR_CODE",
    originX = 0,
    originY = 0,
  } = options;

  const { data, size } = matrix;

  // ピッチ未指定時はドットを5分割（隙間なく塗れる無難な既定値）。
  // 0以下・ドット超過は安全側に丸める。
  let pitch = hatchPitchMm && hatchPitchMm > 0 ? hatchPitchMm : dotSizeMm / 5;
  if (pitch > dotSizeMm) pitch = dotSizeMm;

  // 行内で連続する暗モジュールの水平ラン [colStart, colEnd) を列挙
  function darkRuns(row_: number): Array<[number, number]> {
    const runs: Array<[number, number]> = [];
    let start = -1;
    for (let col = 0; col < size; col++) {
      const dark = data[row_ * size + col] !== 0;
      if (dark && start < 0) start = col;
      else if (!dark && start >= 0) {
        runs.push([start, col]);
        start = -1;
      }
    }
    if (start >= 0) runs.push([start, size]);
    return runs;
  }

  // コード全体を一定ピッチの水平スキャンラインで走査し、暗ランを横切る線分を出力。
  // 隣接モジュールはランとして繋がり、重複線も出ない。
  let entities = "";
  const totalHeight = size * dotSizeMm;
  for (let y = pitch / 2; y < totalHeight; y += pitch) {
    const fromBottom = Math.floor(y / dotSizeMm); // 下から数えたモジュール行
    const row_ = size - 1 - fromBottom; // 行列上の行インデックス（上が0）
    if (row_ < 0 || row_ >= size) continue;
    const worldY = originY + y;
    for (const [colStart, colEnd] of darkRuns(row_)) {
      const x1 = originX + colStart * dotSizeMm;
      const x2 = originX + colEnd * dotSizeMm;
      entities += lineEntity(x1, worldY, x2, worldY, layerName);
    }
  }

  return (
    headerSection() +
    tablesSection(layerName) +
    row(0, "SECTION") +
    row(2, "ENTITIES") +
    entities +
    row(0, "ENDSEC") +
    row(0, "EOF")
  );
}

export function downloadDXF(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateFilename(prefix = "QR"): string {
  const now = new Date();
  const ts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `${prefix}_${ts}.dxf`;
}
