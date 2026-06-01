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
  totalSizeMm: number;
  dotSizeMm: number;
}

function versionToModules(version: number): number {
  return 21 + (version - 1) * 4;
}

export async function generateQRMatrix(
  text: string,
  errorLevel: ErrorCorrectionLevel,
  targetSizeMm?: number
): Promise<QRInfo> {
  if (!text.trim()) throw new Error("テキストを入力してください");

  const qrData = await QRCode.create(text, {
    errorCorrectionLevel: errorLevel,
    version: undefined,
  });

  const size = qrData.modules.size;
  const data = qrData.modules.data as unknown as Uint8ClampedArray;
  const version = qrData.version;

  const moduleCount = versionToModules(version);
  const dotSizeMm = targetSizeMm
    ? Math.floor((targetSizeMm / moduleCount) * 1000) / 1000
    : 1.0;
  const totalSizeMm = targetSizeMm
    ? Math.round(targetSizeMm * 10) / 10
    : Math.round(moduleCount * dotSizeMm * 10) / 10;

  return {
    matrix: { data, size },
    version,
    moduleCount,
    totalSizeMm,
    dotSizeMm,
  };
}

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
