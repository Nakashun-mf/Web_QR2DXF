import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode2,
  RefreshCw,
  ScanLine,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Label, Separator } from "@/components/ui/primitives";
import {
  generateQRMatrix,
  drawQRToCanvas,
  type ErrorCorrectionLevel,
  type QRInfo,
} from "@/lib/qr-generator";
import {
  exportToDXF,
  downloadDXF,
  generateFilename,
} from "@/lib/dxf-exporter";

const ERROR_LEVELS: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: "L", label: "L", desc: "7% — 高速・小サイズ" },
  { value: "M", label: "M", desc: "15% — 推奨（汎用）" },
  { value: "Q", label: "Q", desc: "25% — 耐汚損性高" },
  { value: "H", label: "H", desc: "30% — 最高耐性" },
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const [targetSizeMm, setTargetSizeMm] = useState(15);
  const [qrInfo, setQrInfo] = useState<QRInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(
    async (text: string, level: ErrorCorrectionLevel, sizeMm: number) => {
      if (!text.trim()) {
        setQrInfo(null);
        setError(null);
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        const info = await generateQRMatrix(text, level, sizeMm);
        setQrInfo(info);
        if (canvasRef.current) {
          await drawQRToCanvas(canvasRef.current, text, level, 10);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "生成エラーが発生しました");
        setQrInfo(null);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generate(inputText, errorLevel, targetSizeMm);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText, errorLevel, targetSizeMm, generate]);

  const handleDownload = async () => {
    if (!qrInfo || !inputText.trim()) return;
    setIsDownloading(true);
    try {
      const dxfContent = exportToDXF(qrInfo.matrix, {
        dotSizeMm: qrInfo.dotSizeMm,
      });
      const filename = generateFilename("QR");
      downloadDXF(dxfContent, filename);
      setLastDownloaded(filename);
    } catch (e) {
      setError("DXF出力に失敗しました");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setInputText("");
    setErrorLevel("M");
    setTargetSizeMm(15);
    setQrInfo(null);
    setError(null);
    setLastDownloaded(null);
  };

  const charCount = inputText.length;
  const isReady = !!qrInfo && !isGenerating && !error;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <ScanLine className="w-5 h-5" />
            <span className="font-bold text-base tracking-tight">QR Code DXF Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-primary" />
                コンテンツ入力
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  テキスト / URL / 英数字
                </Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={"例: PART-2024-00123\nまたは https://example.com"}
                  className="h-[88px] font-mono text-sm"
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${charCount > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                    {charCount} / 500
                  </span>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/5 border border-destructive/20 text-destructive text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                エラー訂正レベル
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {ERROR_LEVELS.map((lv) => (
                  <button
                    key={lv.value}
                    onClick={() => setErrorLevel(lv.value)}
                    className={`flex flex-col items-start p-3 rounded-md border text-left transition-colors ${
                      errorLevel === lv.value
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-white hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className="font-bold text-base leading-none mb-1">{lv.label}</span>
                    <span className={`text-xs leading-tight ${errorLevel === lv.value ? "text-accent-foreground" : "text-muted-foreground"}`}>
                      {lv.desc}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                刻印サイズ
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                一辺の長さ (mm) — MB3315S は最大 15mm
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={33}
                  step={0.5}
                  value={targetSizeMm}
                  onChange={(e) => setTargetSizeMm(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-mono font-medium w-14 text-right">
                  {targetSizeMm} mm
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleDownload}
              disabled={!isReady || isDownloading}
              size="lg"
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "出力中..." : "DXF をダウンロード"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="default"
              className="w-full gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              リセット
            </Button>
          </div>

          {lastDownloaded && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono truncate">{lastDownloaded}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-primary" />
                プレビュー
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center w-full min-h-[200px] rounded-md bg-muted/30 border border-dashed border-border">
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md z-10">
                    <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  </div>
                )}
                {!inputText.trim() && !isGenerating && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <ScanLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    コンテンツを入力するとプレビューが表示されます
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className={`max-w-full max-h-[240px] object-contain ${!inputText.trim() ? "hidden" : ""}`}
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {qrInfo && (
                <div className="w-full space-y-3">
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "バージョン",   value: `Version ${qrInfo.version}` },
                      { label: "モジュール数", value: `${qrInfo.moduleCount} × ${qrInfo.moduleCount}` },
                      { label: "出力サイズ",   value: `${qrInfo.totalSizeMm} mm 正方形` },
                      { label: "ドット精度",   value: `${qrInfo.dotSizeMm} mm / ドット` },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/40 rounded-md p-2.5">
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="text-sm font-medium mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/40 text-xs text-muted-foreground">
                    <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                    DXFレイヤー名：<span className="font-mono text-foreground">QR_CODE</span>
                    ／単位：<span className="font-mono text-foreground">mm</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t mt-4">
        <div className="max-w-5xl mx-auto px-4 h-10 flex items-center">
          <span className="text-xs text-muted-foreground">
            QR Code DXF Generator — DXF形式 (AutoCAD 2000 / AC1015) ／ 単位 mm
          </span>
        </div>
      </footer>
    </div>
  );
}
