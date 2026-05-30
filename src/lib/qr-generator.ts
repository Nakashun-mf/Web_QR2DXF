import QRCode from "qrcode";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRMatrix {
  data: Uint8ClampedArray;
  size: number;
}

export interface QRInfo {
  matrix: QRMatrix;
  version: number;
  moduleCount: number;
  recommendedSizeMm: number;
  dotSizeMm: number;
  fitsInMarkingArea: boolean;
}

// MB3315S のマーキングエリア
export const MARKING_AREA = {
  width: 33,
  height: 15,
} as const;

// バージョンからモジュール数を計算
function versionToModules(version: number): number {
  return 21 + (version - 1) * 4;
}

// モジュール数から最適なドットサイズを計算（最大 13mm 正方形に収める）
function calcDotSize(moduleCount: number): number {
  const maxSize = Math.min(MARKING_AREA.width - 4, MARKING_AREA.height - 2); // 余白込み
  return Math.floor((maxSize / moduleCount) * 100) / 100;
}

export async function generateQRMatrix(
  text: string,
  errorLevel: ErrorCorrectionLevel
): Promise<QRInfo> {
  if (!text.trim()) throw new Error("テキストを入力してください");

  // QRコードのデータ取得
  const qrData = await QRCode.create(text, {
    errorCorrectionLevel: errorLevel,
    version: undefined, // 自動決定
  });

  const size = qrData.modules.size;
  const data = qrData.modules.data as unknown as Uint8ClampedArray;
  const version = qrData.version;

  const moduleCount = versionToModules(version);
  const dotSize = calcDotSize(moduleCount);
  const recommendedSizeMm = Math.round(moduleCount * dotSize * 10) / 10;
  const fitsInMarkingArea =
    recommendedSizeMm <= MARKING_AREA.width - 4 &&
    recommendedSizeMm <= MARKING_AREA.height - 2;

  return {
    matrix: { data, size },
    version,
    moduleCount,
    recommendedSizeMm,
    dotSizeMm: dotSize,
    fitsInMarkingArea,
  };
}

// Canvas にQRコードを描画
export async function drawQRToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  errorLevel: ErrorCorrectionLevel,
  scale = 8
): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: errorLevel,
    margin: 1,
    scale,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
