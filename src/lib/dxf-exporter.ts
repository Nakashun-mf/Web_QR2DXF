import type { QRMatrix } from "./qr-generator";

interface DXFOptions {
  dotSizeMm: number;
  layerName?: string;
  originX?: number;
  originY?: number;
}

const EOL = "\r\n";

function row(groupCode: number | string, value: string | number): string {
  return `${groupCode}${EOL}${value}${EOL}`;
}

function solidEntity(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  layer: string
): string {
  return (
    row(0, "SOLID") +
    row(8, layer) +
    row(62, 256) +
    row(10, x1.toFixed(4)) +
    row(20, y1.toFixed(4)) +
    row(30, "0.0000") +
    row(11, x2.toFixed(4)) +
    row(21, y1.toFixed(4)) +
    row(31, "0.0000") +
    row(12, x1.toFixed(4)) +
    row(22, y2.toFixed(4)) +
    row(32, "0.0000") +
    row(13, x2.toFixed(4)) +
    row(23, y2.toFixed(4)) +
    row(33, "0.0000")
  );
}

function headerSection(): string {
  return (
    row(0, "SECTION") +
    row(2, "HEADER") +
    row(9, "$ACADVER") +
    row(1, "AC1015") +
    row(9, "$INSUNITS") +
    row(70, 4) +
    row(9, "$MEASUREMENT") +
    row(70, 1) +
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

function blocksSection(): string {
  const modelSpace =
    row(0, "BLOCK") +
    row(8, "0") +
    row(2, "*Model_Space") +
    row(70, 0) +
    row(10, "0.0") +
    row(20, "0.0") +
    row(30, "0.0") +
    row(3, "*Model_Space") +
    row(1, "") +
    row(0, "ENDBLK") +
    row(8, "0");

  const paperSpace =
    row(0, "BLOCK") +
    row(8, "0") +
    row(2, "*Paper_Space") +
    row(70, 0) +
    row(10, "0.0") +
    row(20, "0.0") +
    row(30, "0.0") +
    row(3, "*Paper_Space") +
    row(1, "") +
    row(0, "ENDBLK") +
    row(8, "0");

  return (
    row(0, "SECTION") +
    row(2, "BLOCKS") +
    modelSpace +
    paperSpace +
    row(0, "ENDSEC")
  );
}

export function exportToDXF(matrix: QRMatrix, options: DXFOptions): string {
  const {
    dotSizeMm,
    layerName = "QR_CODE",
    originX = 0,
    originY = 0,
  } = options;

  const { data, size } = matrix;

  let entities = "";
  for (let row_ = 0; row_ < size; row_++) {
    for (let col = 0; col < size; col++) {
      const idx = row_ * size + col;
      if (data[idx] !== 0) {
        const x1 = originX + col * dotSizeMm;
        const y1 = originY + (size - 1 - row_) * dotSizeMm;
        entities += solidEntity(x1, y1, x1 + dotSizeMm, y1 + dotSizeMm, layerName);
      }
    }
  }

  return (
    headerSection() +
    tablesSection(layerName) +
    blocksSection() +
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
