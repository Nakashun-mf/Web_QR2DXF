# QR Code DXF Generator

[![Deploy to GitHub Pages](https://github.com/Nakashun-mf/Web_QRtoDXF/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nakashun-mf/Web_QRtoDXF/actions/workflows/deploy.yml)

テキスト・URL・英数字から QR コードを生成し、DXF ファイルとしてダウンロードできる Web アプリ。

**公開 URL:** https://nakashun-mf.github.io/Web_QRtoDXF/

---

## 機能

- テキスト / URL / 英数字から QR コードを生成
- エラー訂正レベル選択（L / M / Q / H）
- リアルタイムプレビュー
- DXF 形式でダウンロード（AutoCAD 2000 / 単位: mm）

## DXF 仕様

| 項目 | 値 |
|------|-----|
| 形式 | AutoCAD 2000 (AC1015) |
| 単位 | mm |
| エンティティ | SOLID（塗りつぶし矩形） |
| レイヤー名 | `QR_CODE` |
| ドットサイズ | 1.0 mm / モジュール |

## ローカル開発

```bash
npm install
npm run dev
```

## デプロイ

`main` ブランチへの push で GitHub Actions が自動的にビルド & GitHub Pages へデプロイします。

## デバッグ

URL に `?debug=true` を付けると Eruda コンソールが起動します。
