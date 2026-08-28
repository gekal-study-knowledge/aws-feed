# AWS Feed 購読システム - エージェントガイド

このドキュメントは、AWS Feed 購読システムの開発・保守タスクを行う AI エージェント向けのガイドラインです。

## プロジェクト概要

AWS 公式の RSS フィードを自動的に購読し、日単位でまとめた Markdown レポートを生成し、Next.js で閲覧できるシステムです。

### 主要機能

- **自動フィード取得**: AWS What's New、AWS News Blog など 8 つのフィードを取得
- **変更検出**: 新規エントリーのみを MD5 ハッシュで重複判定
- **日単位レポート**: 新しい情報が公開された日ごとに Markdown ファイルを生成
- **GitHub Actions 連携**: 1 時間ごとに自動実行し、変更を自動コミット
- **Next.js + GitHub Pages 公開**: モダンな UI でレポートを閲覧可能（ダークモード対応）

## ディレクトリ構成

```
aws-feed/
├── .github/
│   ├── scripts/
│   │   ├── main.py              # フィード取得スクリプト
│   │   ├── config.yaml          # フィード設定
│   │   └── requirements.txt     # Python 依存パッケージ
│   └── workflows/
│       ├── fetch-feeds.yml      # フィード取得ワークフロー
│       └── deploy.yml           # デプロイワークフロー
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # UI コンポーネント (Atoms/Molecules/Organisms)
│   ├── lib/                     # ユーティリティ (posts.ts など)
│   ├── theme/                   # MUI テーマ設定
│   └── utils/                   # 共通ユーティリティ
├── data/                        # 日毎・情報源ごとの YAML データ (自動生成)
│   └── YYYY/
│       └── MM/
│           └── YYYY-MM-DD/
│               ├── aws_whats_new.yaml
│               └── ...
├── _posts/                      # 日単位の Markdown レポート (自動生成)
│   └── YYYY/
│       └── MM/
│           └── YYYY-MM-DD-news.md
├── package.json                 # Node.js 依存パッケージ
└── tsconfig.json                # TypeScript 設定
```

## 技術スタック

### バックエンド（フィード取得）

- **Python 3.x**
- **feedparser**: RSS フィード解析
- **PyYAML**: YAML 読み書き

### フロントエンド（Web UI）

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Material UI v7**
- **date-fns**: 日付処理
- **remark**: Markdown → HTML 変換

### インフラ

- **GitHub Actions**: 自動実行とデプロイ
- **GitHub Pages**: 静的ホスティング

## 開発コマンド

### Python（フィード取得）

```bash
# 新規フィードを取得
python3 .github/scripts/main.py

# 全レポートを再生成
python3 .github/scripts/main.py --rebuild
```

### Node.js（開発・ビルド）

```bash
# 依存パッケージインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# 静的ファイルのプレビュー
npm run start

# リント
npm run lint

# リント修正
npm run lint:fix

# フォーマット
npm run format
```

## コーディング規約

### TypeScript/React

- **関数コンポーネント**: アロー関数で定義
- **型定義**: TypeScript を厳格に使用し、`any` の使用を避ける
- **コンポーネント設計**: Atomic Design の考え方（Atoms/Molecules/Organisms）に従う
- **MUI 使用**: Material UI を使用し、一貫したデザインを維持

### Python

- **スタイル**: PEP 8 に準拠
- **型ヒント**: 可能な限り型ヒントを使用

### フォーマット・リント

- **フォーマッター**: Prettier（自動フォーマット）
- **リンター**: ESLint（TypeScript/React）、flake8 または ruff（Python）

コミット前に必ずフォーマットとリントを実行してください：

```bash
npm run format
npm run lint:fix
```

## 主要ファイルの説明

### `.github/scripts/main.py`

RSS フィードを取得し、新規エントリーを検出して YAML データと Markdown レポートを生成するメインスクリプト。

### `.github/scripts/check_summaries.py`

AI 概要 (`summary.yaml`) の再生成が必要な日を洗い出すスクリプト。各日の
`generated_at` と各エントリーの `fetched` を突き合わせ、概要を作った後に取得された
エントリーがある日を報告する。`--since` / `--json` / `--quiet` に対応し、対応が必要な
日があれば終了コード 1 を返す。概要を生成・更新したら、このスクリプトで
「対応が必要な日はありません」になることを確認する。

### `.github/scripts/summary_digest.py`

AI 概要を書くためのダイジェストを作るスクリプト。フィードの `summary` は HTML で
数万文字になることがあるため、HTML を落として情報源ごとに指定文字数へ切り詰める。
`--missing` / `--stale` で対象日を `check_summaries.py` と同じ判定から拾える。
`--limit` はフィードの性格に合わせて変える (目安はスキルに記載)。

### `.github/scripts/write_summary.py`

生成した概要を `summary.yaml` へ書き出すスクリプト。入力 JSON には `date` /
`overview` / `topics` だけを書き、`article_count` と `sources` は実データから
数え直す。`generated_at` は実行時刻を秒まで記録する。既存ファイルは既定でスキップし、
作り直すときだけ `--force` を付ける。

### `.github/scripts/config.yaml`

フィード設定ファイル。以下の形式でフィードを追加・編集可能：

```yaml
feeds:
  - name: '表示名'
    url: 'RSS フィードの URL'
    source_id: '一意な識別子'
```

### `src/lib/posts.ts`

Markdown レポートの読み込み・解析を行うユーティリティ。

### `src/components/`

UI コンポーネント：

- **Atoms**: ボタン、タイポグラフィなど最小単位
- **Molecules**: カード、リストアイテムなど
- **Organisms**: ヘッダー、記事一覧など複合コンポーネント

## GitHub Actions 設定

### 実行スケジュール

- **自動実行**: 1 時間ごと (毎時 0 分)
- **手動実行**: GitHub Actions タブから手動トリガー可能

### 必要な設定

1. **Workflow permissions**: Settings → Actions → General → 「Read and write permissions」
2. **Pages 設定**: Settings → Pages → Source: 「Deploy from a branch」、Branch: 「main」

## 出力形式

### データファイル (YAML)

`data/YYYY/MM/YYYY-MM-DD/<source_id>.yaml`

```yaml
entries:
  '<md5_hash>':
    'id': '<md5_hash>'
    'title': '記事タイトル'
    'link': 'https://...'
    'published': '2026-03-20 18:38:00'
    'summary': '記事概要...'
last_updated: '2026-03-21 10:45:50 JST'
```

### 日単位レポート (Markdown)

`_posts/YYYY/MM/YYYY-MM-DD-news.md`

```markdown
---
layout: default
title: AWS News - 2026-03-20
news_counter: 15
last_updated: '2026-03-21 10:45:50 JST'
---

# AWS Updates - 2026-03-20

## AWS What's New

### 記事タイトル

- **Link**: [URL](...)
- **Published**: 2026-03-20

記事概要...
```

## トラブルシューティング

### GitHub Actions でコミットできない

リポジトリ設定で Workflow permissions を「Read and write permissions」に変更。

### ビルドエラー

```bash
# 依存パッケージ再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
rm -rf .next out
npm run build
```

### 重複エントリー

エントリー ID はリンクとタイトルの MD5 ハッシュ。フィード内容変更時は新規扱いされる場合あり。

## 変更時のチェックリスト

### Python スクリプト変更時

- [ ] ローカルで `python3 .github/scripts/main.py` を実行
- [ ] YAML データが正しく生成されるか確認
- [ ] Markdown レポートが正しく生成されるか確認

### フロントエンド変更時

- [ ] `npm run dev` で開発サーバー起動
- [ ] 各ページ表示を確認
- [ ] `npm run build` でビルドエラーなしを確認
- [ ] `npm run lint` でエラーなしを確認

### 設定ファイル変更時

- [ ] YAML 構文チェック
- [ ] 必要なフィールドが揃っているか確認

## ベストプラクティス

1. **小さく頻繁にコミット**: 変更は論理的な単位で分割
2. **テスト**: 可能であれば変更に対するテストを追加
3. **ドキュメント更新**: 機能変更時は README.md も更新
4. **型安全性**: TypeScript の型を適切に定義し、型エラーを放置しない
5. **パフォーマンス**: 大量データを扱う際はメモリ・処理時間を考慮

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Material UI ドキュメント](https://mui.com/material-ui/)
- [feedparser ドキュメント](https://pythonhosted.org/feedparser/)
- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
