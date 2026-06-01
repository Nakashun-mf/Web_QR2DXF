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
  const [qrInfo, setQrInfo] = useState<QRInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(
    async (text: string, level: ErrorCorrectionLevel) => {
      if (!text.trim()) {
        setQrInfo(null);
        setError(null);
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        const info = await generateQRMatrix(text, level);
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
      generate(inputText, errorLevel);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText, errorLevel, generate]);

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
    setQrInfo(null);
    setError(null);
    setLastDownloaded(null);
  };

  const charCount = inputText.length;
  const isReady = !!qrInfo && !isGenerating && !error;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-[var(--line)] bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ScanLine className="w-[18px] h-[18px] text-[var(--signal)]" strokeWidth={1.75} />
            <span className="font-semibold text-sm text-[var(--ink)]">QR Code DXF Generator</span>
          </div>
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--ink-3)]">
            GEN-031
          </span>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Content input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[var(--ink)]">
                <FileCode2 className="w-4 h-4 text-[var(--ink-3)]" strokeWidth={1.75} />
                コンテンツ入力
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <Label className="text-xs text-[var(--ink-3)] mb-1.5 block font-normal">
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
                  <span className={`font-mono text-[11px] font-medium tracking-[0.06em] ${
                    charCount > 450
                      ? "text-[var(--danger)]"
                      : "text-[var(--ink-4)]"
                  }`}>
                    {charCount} / 500
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-[var(--danger-wash)] border border-[var(--danger-line)] text-[var(--danger)] text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={1.75} />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error correction level */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[var(--ink)]">
                <Settings2 className="w-4 h-4 text-[var(--ink-3)]" strokeWidth={1.75} />
                エラー訂正レベル
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {ERROR_LEVELS.map((lv) => (
                  <button
                    key={lv.value}
                    onClick={() => setErrorLevel(lv.value)}
                    className={`flex flex-col items-start p-3 rounded-md border text-left transition-all duration-[170ms] ${
                      errorLevel === lv.value
                        ? "border-[var(--signal-line)] bg-[var(--signal-wash)] text-[var(--signal-ink)]"
                        : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--line-2)] text-[var(--ink)]"
                    }`}
                  >
                    <span className="font-bold text-base leading-none mb-1">{lv.label}</span>
                    <span className={`text-xs leading-tight font-normal ${
                      errorLevel === lv.value
                        ? "text-[var(--signal-ink)]"
                        : "text-[var(--ink-3)]"
                    }`}>
                      {lv.desc}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleDownload}
              disabled={!isReady || isDownloading}
              size="lg"
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" strokeWidth={1.75} />
              {isDownloading ? "出力中..." : "DXF をダウンロード"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="default"
              className="w-full gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
              リセット
            </Button>
          </div>

          {/* Success state */}
          {lastDownloaded && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--signal-wash)] border border-[var(--signal-line)] text-[var(--signal-ink)] text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span className="font-mono truncate">{lastDownloaded}</span>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[var(--ink)]">
                <ScanLine className="w-4 h-4 text-[var(--ink-3)]" strokeWidth={1.75} />
                プレビュー
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">

              {/* Canvas area */}
              <div className="relative flex items-center justify-center w-full min-h-[200px] rounded-md bg-[var(--paper-2)] border border-dashed border-[var(--line-2)]">
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]/80 rounded-md z-10">
                    <RefreshCw className="w-5 h-5 text-[var(--signal)] animate-spin" strokeWidth={1.75} />
                  </div>
                )}
                {!inputText.trim() && !isGenerating && (
                  <div className="text-center py-8 flex flex-col items-center gap-2">
                    <ScanLine className="w-10 h-10 text-[var(--ink-4)]" strokeWidth={1.5} />
                    <p className="text-xs text-[var(--ink-3)] font-normal leading-snug">
                      コンテンツを入力すると<br />プレビューが表示されます
                    </p>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className={`max-w-full max-h-[240px] object-contain ${!inputText.trim() ? "hidden" : ""}`}
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {/* QR info stats */}
              {qrInfo && (
                <div className="w-full space-y-3">
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "VERSION",     value: `Version ${qrInfo.version}` },
                      { label: "MODULES",     value: `${qrInfo.moduleCount} × ${qrInfo.moduleCount}` },
                      { label: "OUTPUT SIZE", value: `${qrInfo.totalSizeMm} mm` },
                      { label: "DOT SIZE",    value: `${qrInfo.dotSizeMm} mm / dot` },
                    ].map((item) => (
                      <div key={item.label} className="bg-[var(--paper-2)] rounded-md p-2.5">
                        <div className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--ink-4)]">
                          {item.label}
                        </div>
                        <div className="font-mono text-sm font-medium mt-1 text-[var(--ink)]">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-[var(--paper-2)]">
                    <FileCode2 className="w-3.5 h-3.5 shrink-0 text-[var(--ink-4)]" strokeWidth={1.75} />
                    <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em] uppercase">
                      Layer: <span className="text-[var(--ink)]">QR_CODE</span>
                      &nbsp;·&nbsp;
                      Unit: <span className="text-[var(--ink)]">mm</span>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--line)] mt-4">
        <div className="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between">
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--ink-4)]">
            GEN-031 · DXF / AutoCAD 2000 · mm
          </span>
        </div>
      </footer>
    </div>
  );
}
