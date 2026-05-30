# CLAUDE.md — QR Code DXF Generator セットアップ指示書

このファイルは Claude Code 向けの作業指示書です。
ZIPを解凍した直後の状態からGitHub Pages 公開まで、順番通りに実行してください。

---

## 前提確認

作業開始前に以下を確認してください。

```bash
node --version   # v18 以上
git --version
gh --version     # GitHub CLI（なければ下記でインストール）
```

GitHub CLI が未インストールの場合：

```bash
# macOS
brew install gh

# Windows（winget）
winget install GitHub.cli
```

GitHub CLI の認証（未ログインの場合）：

```bash
gh auth login
# → GitHub.com / HTTPS / ブラウザで認証 を選択
```

---

## Step 1: 依存パッケージのインストール

```bash
cd qr-dxf-generator
npm install
```

インストール完了後、ビルドが通ることを確認：

```bash
npm run build
# ✓ built in X.XXs と表示されれば OK
```

---

## Step 2: GitHub リポジトリ作成 & 初回 Push

```bash
git init
git add .
git commit -m "feat: initial commit — QR Code DXF Generator for MB3315S"

# リポジトリ作成 & Push（1コマンドで完結）
gh repo create qr-dxf-generator \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "東京彫刻 MB3315S 用 QRコード DXF出力ツール"
```

成功すると以下のような出力が出ます：

```
✓ Created repository <username>/qr-dxf-generator on GitHub
✓ Added remote https://github.com/<username>/qr-dxf-generator.git
✓ Pushed commits to https://github.com/<username>/qr-dxf-generator.git
```

---

## Step 3: GitHub Pages を有効化

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/:owner/:repo/pages \
  -f build_type=workflow \
  -f source='{"branch":"main","path":"/"}' 2>/dev/null || true

# Pages の source を GitHub Actions に設定
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/:owner/:repo/pages \
  -f build_type=workflow 2>/dev/null || true
```

上記コマンドがエラーになる場合は手動で設定：

```
GitHub リポジトリ → Settings → Pages → Source → 「GitHub Actions」を選択 → Save
```

---

## Step 4: 自動デプロイの確認

Push 直後から GitHub Actions が自動実行されます。

```bash
# Actions の実行状況を確認
gh run list --limit 3

# 実行ログをリアルタイムで確認
gh run watch
```

デプロイ完了後の公開 URL を確認：

```bash
gh api /repos/:owner/:repo/pages --jq '.html_url'
```

公開 URL の形式：

```
https://<username>.github.io/qr-dxf-generator/
```

---

## Step 5: 動作確認チェックリスト

ブラウザで公開 URL を開き、以下を確認：

- [ ] ページが表示される（真っ白・エラーでない）
- [ ] テキストを入力するとQRコードがリアルタイムでプレビューされる
- [ ] エラー訂正レベル（L/M/Q/H）を切り替えるとQRコードが変わる
- [ ] 「DXFをダウンロード」ボタンで `.dxf` ファイルがダウンロードされる
- [ ] ダウンロードしたファイルをテキストエディタで開き `0\nEOF` で終わっていることを確認
- [ ] URL に `?debug=true` を付けると Eruda コンソールが起動する

---

## トラブルシューティング

### ビルドエラーが出る場合

```bash
# node_modules を再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 が出る（ページが開かない）場合

`vite.config.ts` の `base` がリポジトリ名と一致しているか確認：

```ts
base: "/qr-dxf-generator/",  // リポジトリ名と完全一致すること
```

リポジトリ名を変えた場合はここも変更して再 Push。

### GitHub Actions が失敗する場合

```bash
gh run list
gh run view <run-id> --log
```

---

## 以降の更新方法

ソースを修正したら：

```bash
git add .
git commit -m "fix: <変更内容>"
git push origin main
# → GitHub Actions が自動でビルド & デプロイ
```

---

## プロジェクト構成（参考）

```
qr-dxf-generator/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages 自動デプロイ
├── src/
│   ├── lib/
│   │   ├── qr-generator.ts # QRコード生成・サイズ計算ロジック
│   │   └── dxf-exporter.ts # DXF変換・ダウンロードロジック
│   ├── components/ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── primitives.tsx  # Label, Textarea, Badge, Separator
│   ├── App.tsx             # メインUI
│   ├── main.tsx            # エントリーポイント（Eruda込み）
│   └── index.css           # Tailwind + CSS変数（デジタル庁ブルー）
├── vite.config.ts          # base: "/qr-dxf-generator/"
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## DXF仕様メモ（刻印機インポート時の参考）

| 項目 | 値 |
|------|-----|
| フォーマット | AutoCAD 2000 (AC1015) |
| 単位 | mm |
| エンティティ | SOLID（塗りつぶし矩形） |
| レイヤー名 | `QR_CODE` |
| 対象機器 | 東京彫刻 MarkinBOX MB3315S |
| マーキングエリア | X 33mm × Y 15mm |
| ドットサイズ | 自動計算（内容量に応じて最適化） |
