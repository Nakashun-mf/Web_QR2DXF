import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode2,
  HelpCircle,
  Moon,
  RefreshCw,
  ScanLine,
  Settings2,
  Sun,
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

const ERROR_LEVELS: { value: ErrorCorrectionLevel; label: string; desc: string; detail: string }[] = [
  { value: "L", label: "L", desc: "7% — 高速・小サイズ",     detail: "データ量が少なく読み取り環境が良好な場合に最適" },
  { value: "M", label: "M", desc: "15% — 推奨（汎用）",      detail: "一般的な用途に最適なバランス設定" },
  { value: "Q", label: "Q", desc: "25% — 耐汚損性高",        detail: "汚れや傷がつきやすい環境での刻印に推奨" },
  { value: "H", label: "H", desc: "30% — 最高耐性",          detail: "最も強い誤り訂正。QRコードが大きくなる" },
];

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("qr-dxf-dark");
      if (stored !== null) return stored === "true";
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("qr-dxf-dark", String(dark));
    } catch {}
  }, [dark]);

  return [dark, setDark] as const;
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const [qrInfo, setQrInfo] = useState<QRInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [dark, setDark] = useDarkMode();

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
    } catch {
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
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary flex-1">
            <ScanLine className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold text-base tracking-tight">QR Code DXF Generator</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                テキスト・URLをQRコードに変換してDXFファイルで出力
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowHelp((v) => !v)}
            className={`p-2 rounded-md transition-colors ${
              showHelp
                ? "bg-accent text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label="使い方"
            title="使い方"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDark((v) => !v)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={dark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            title={dark ? "ライトモード" : "ダークモード"}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Help Panel */}
      {showHelp && (
        <div className="border-b bg-accent/40">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              使い方
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
              {[
                { step: "1", title: "テキストを入力", body: "QRコードに埋め込む文字列・URL・品番などを入力します。最大500文字対応。" },
                { step: "2", title: "エラー訂正レベルを選択", body: "刻印後に傷・汚れが想定される場合はQ/Hを推奨。通常はM（デフォルト）で問題ありません。" },
                { step: "3", title: "プレビューで確認", body: "入力に応じてリアルタイムでQRコードが生成されます。バージョンとサイズも自動表示されます。" },
                { step: "4", title: "DXFをダウンロード", body: "「DXFをダウンロード」ボタンを押すと .dxf ファイルが保存されます。CADソフトや刻印機にそのまま読み込めます。" },
              ].map((item) => (
                <li key={item.step} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                  <div>
                    <div className="font-medium text-foreground mb-0.5">{item.title}</div>
                    <div>{item.body}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
              出力DXFは <strong className="text-foreground">AutoCAD 2000 (AC1015)</strong> 形式、単位 <strong className="text-foreground">mm</strong>、レイヤー <strong className="text-foreground font-mono">QR_CODE</strong> に SOLIDエンティティとして格納されます。
            </div>
          </div>
        </div>
      )}

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
              <p className="text-xs text-muted-foreground mt-1">
                QRコードに埋め込むテキスト・URL・数値を入力してください
              </p>
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
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
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
              <p className="text-xs text-muted-foreground mt-1">
                刻印後の読み取り精度に影響します。通常は <strong>M</strong> を推奨
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {ERROR_LEVELS.map((lv) => (
                  <button
                    key={lv.value}
                    onClick={() => setErrorLevel(lv.value)}
                    title={lv.detail}
                    className={`flex flex-col items-start p-3 rounded-md border text-left transition-colors ${
                      errorLevel === lv.value
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
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
              {errorLevel && (
                <p className="text-xs text-muted-foreground mt-2 px-0.5">
                  {ERROR_LEVELS.find((l) => l.value === errorLevel)?.detail}
                </p>
              )}
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
            <div
              className="flex items-center gap-2 p-3 rounded-md text-xs"
              style={{
                backgroundColor: "hsl(var(--success-bg))",
                borderColor: "hsl(var(--success-border))",
                color: "hsl(var(--success))",
                border: "1px solid",
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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
              <p className="text-xs text-muted-foreground mt-1">
                入力に応じてリアルタイムで生成されます
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">

              {/* Canvas area */}
              <div className="relative flex items-center justify-center w-full min-h-[200px] rounded-md bg-[var(--paper-2)] border border-dashed border-[var(--line-2)]">
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md z-10">
                    <RefreshCw className="w-5 h-5 text-primary animate-spin" />
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
                      { label: "バージョン",   value: `Version ${qrInfo.version}`,                 hint: "データ量に応じて自動決定" },
                      { label: "モジュール数", value: `${qrInfo.moduleCount} × ${qrInfo.moduleCount}`, hint: "QRコードのセル数" },
                      { label: "出力サイズ",   value: `${qrInfo.totalSizeMm} mm 正方形`,           hint: "DXFファイルでの実寸" },
                      { label: "ドット精度",   value: `${qrInfo.dotSizeMm} mm / ドット`,           hint: "1セルのサイズ" },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/40 rounded-md p-2.5" title={item.hint}>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="text-sm font-medium mt-0.5">{item.value}</div>
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
