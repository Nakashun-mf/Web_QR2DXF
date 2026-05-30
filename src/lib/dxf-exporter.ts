import type { QRMatrix } from "./qr-generator";

interface DXFOptions {
  dotSizeMm: number;
  layerName?: string;
  originX?: number;
  originY?: number;
}

// SOLID エンティティを生成（塗りつぶし矩形）
function solidEntity(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  layer: string
): string {
  // DXF SOLID: 4点で塗りつぶし形状を定義
  // 点の順序: 左下 → 右下 → 左上 → 右上
  return [
    "0", "SOLID",
    "8", layer,
    "62", "256",        // カラー: BYLAYER
    "10", x1.toFixed(4),
    "20", y1.toFixed(4),
    "30", "0.0",
    "11", x2.toFixed(4),
    "21", y1.toFixed(4),
    "31", "0.0",
    "12", x1.toFixed(4),
    "22", y2.toFixed(4),
    "32", "0.0",
    "13", x2.toFixed(4),
    "23", y2.toFixed(4),
    "33", "0.0",
  ].join("\n");
}

export function exportToDXF(matrix: QRMatrix, options: DXFOptions): string {
  const {
    dotSizeMm,
    layerName = "QR_CODE",
    originX = 0,
    originY = 0,
  } = options;

  const { data, size } = matrix;
  const lines: string[] = [];

  // ── HEADER セクション ──────────────────────────────
  lines.push("0", "SECTION", "2", "HEADER");
  lines.push("9", "$ACADVER", "1", "AC1015");   // AutoCAD 2000 形式
  lines.push("9", "$INSUNITS", "70", "4");       // 単位: mm
  lines.push("9", "$MEASUREMENT", "70", "1");    // メートル法
  lines.push("0", "ENDSEC");

  // ── TABLES セクション（レイヤー定義）─────────────
  lines.push(
    "0", "SECTION",
    "2", "TABLES",
    "0", "TABLE",
    "2", "LAYER",
    "70", "1",
    "0", "LAYER",
    "2", layerName,
    "70", "0",
    "62", "7",          // 色: 白 (AutoCAD ACI 7)
    "6", "CONTINUOUS",
    "0", "ENDTAB",
    "0", "ENDSEC"
  );

  // ── ENTITIES セクション ────────────────────────────
  lines.push("0", "SECTION", "2", "ENTITIES");

  let dotCount = 0;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const idx = row * size + col;
      const isDark = data[idx] !== 0;

      if (isDark) {
        const x1 = originX + col * dotSizeMm;
        const y1 = originY + (size - 1 - row) * dotSizeMm; // Y軸反転
        const x2 = x1 + dotSizeMm;
        const y2 = y1 + dotSizeMm;

        lines.push(solidEntity(x1, y1, x2, y2, layerName));
        dotCount++;
      }
    }
  }

  lines.push("0", "ENDSEC");
  lines.push("0", "EOF");

  return lines.join("\n");
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

// ファイル名生成（タイムスタンプ付き）
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
