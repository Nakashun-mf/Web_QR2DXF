# QR Code DXF Generator

[![Deploy to GitHub Pages](https://github.com/Nakashun-mf/Web_QRtoDXF/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nakashun-mf/Web_QRtoDXF/actions/workflows/deploy.yml)

東京彫刻 **MarkinBOX MB3315S** 専用の QRコード DXF 出力 Web アプリ。

**公開 URL:** https://nakashun-mf.github.io/Web_QRtoDXF/

---

## 機能

- テキスト / URL / 英数字から QR コードを生成
- エラー訂正レベル選択（L / M / Q / H）
- マーキングエリア適合チェック（X 33mm × Y 15mm）
- DXF 形式でダウンロード（AutoCAD 2000 / 単位: mm）
- リアルタイムプレビュー

## DXF 仕様

| 項目 | 値 |
|------|-----|
| 形式 | AutoCAD 2000 (AC1015) |
| 単位 | mm |
| エンティティ | SOLID（塗りつぶし矩形） |
| レイヤー名 | `QR_CODE` |
| 対象機器 | 東京彫刻 MarkinBOX MB3315S |
| マーキングエリア | X 33mm × Y 15mm |
| ドットサイズ | 自動計算（内容量に応じて最適化） |

## ローカル開発

```bash
npm install
npm run dev
```

## デプロイ

`main` ブランチへの push で GitHub Actions が自動的にビルド & GitHub Pages へデプロイします。

## デバッグ

URL に `?debug=true` を付けると Eruda コンソールが起動します。
