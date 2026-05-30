# QR Code DXF Generator

東京彫刻 **MarkinBOX MB3315S** 専用の QRコード DXF 出力 Webアプリ。

## 機能

- テキスト / URL / 英数字からQRコードを生成
- エラー訂正レベル選択（L / M / Q / H）
- マーキングエリア適合チェック（X33mm × Y15mm）
- DXF形式でダウンロード（AutoCAD 2000 / 単位: mm）
- リアルタイムプレビュー

## DXF仕様

| 項目 | 値 |
|------|----|
| 形式 | AutoCAD 2000 (AC1015) |
| 単位 | mm |
| エンティティ | SOLID（塗りつぶし矩形） |
| レイヤー名 | QR_CODE |
| ドットサイズ | 自動計算（マーキングエリア最大13mm） |

## 開発セットアップ

npm install
npm run dev

## デプロイ（Cloudflare Pages）

### 1. プロジェクト作成
npx wrangler pages project create qr-dxf-generator

### 2. GitHub Secrets 設定
CLOUDFLARE_API_TOKEN — Cloudflare Dashboard > My Profile > API Tokens
CLOUDFLARE_ACCOUNT_ID — Cloudflare Dashboard > 右サイドバー

### 3. main ブランチに push → 自動デプロイ

## デバッグ
URL に ?debug=true を付けると Eruda コンソールが起動します。
