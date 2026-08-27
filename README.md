# AWS Feed 購読システム

AWS 公式の RSS フィードを自動的に購読し、日単位でまとめた Markdown レポートを生成し、Next.js で閲覧できるシステムです。

## 機能

- **自動フィード取得**: AWS What's New、AWS News Blog、AWS Security Blog など 8 つのフィードを取得
- **変更検出**: 新規エントリーのみを検出して処理（MD5 ハッシュで重複判定）
- **日単位レポート**: 新しい情報が公開された日ごとに Markdown ファイルを生成
- **GitHub Actions 連携**: 1 時間ごとに自動実行し、変更を自動コミット
- **Next.js + GitHub Pages 公開**: モダンな UI でレポートを閲覧可能（ダークモード対応）
- **既読管理**: 日別ページ単位で既読/更新状態を表示。Google ログイン時は Cloud Firestore に保存され、複数デバイス間で同期（未ログイン時は localStorage で動作）

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
│   └── theme/                   # MUI テーマ設定
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

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/gekal-study-knowledge/aws-feed.git
cd aws-feed
```

### 2. Python 依存パッケージのインストール

```bash
pip install -r .github/scripts/requirements.txt
```

### 3. Node.js 依存パッケージのインストール

```bash
npm install
```

### 4. ローカルでの実行

#### フィード取得（Python）

```bash
python .github/scripts/main.py
```

初回実行時は全エントリーが新規として扱われ、日単位の Markdown が生成されます。

#### 全レポートの再生成

```bash
python .github/scripts/main.py --rebuild
```

#### 開発サーバーの起動（Next.js）

```bash
npm run dev
```

http://localhost:3000 でプレビューできます。

## GitHub Actions での自動実行

### 設定方法

1. GitHub リポジトリにコードをプッシュ
2. リポジトリの Settings → Actions → General で、Workflow permissions を「Read and write permissions」に設定
3. リポジトリの Settings → Pages で、Source を「Deploy from a branch」、Branch を「main」、Folder を「`/ (root)`」に設定

### 実行スケジュール

- **自動実行**: 1 時間ごと (毎時 0 分)
- **手動実行**: GitHub の Actions タブから「Fetch AWS Feeds」ワークフローを選択し、「Run workflow」をクリック

### 動作フロー

1. **フィード取得ジョブ**:
   - フィードを取得
   - 新規エントリーを検出（MD5 ハッシュで重複判定）
   - YAML データを更新 (`data/`)
   - 日単位の Markdown を生成 (`_posts/`)
   - 変更があれば自動コミット&プッシュ

2. **デプロイジョブ** (変更がある場合のみ):
   - Next.js ビルド (`npm run build`)
   - 静的ファイルを GitHub Pages にデプロイ

## GitHub Pages での公開

設定完了後、以下の URL でアクセス可能になります:

```
https://gekal-study-knowledge.github.io/aws-feed/
```

### 表示内容

- **トップページ**: 最近の記事（先月 1 日〜）と月別アーカイブ
- **アーカイブページ**: 月単位で記事をリスト表示
- **記事ページ**: 日単位の AWS ニュースを情報源別に表示
- **ダークモード対応**: 右上のトグルで切り替え可能

## 設定ファイル (config.yaml)

場所：`.github/scripts/config.yaml`

```yaml
feeds:
  - name: "AWS What's New"
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/'
    source_id: 'aws_whats_new'

  - name: 'AWS News Blog'
    url: 'https://aws.amazon.com/blogs/aws/feed/'
    source_id: 'aws_news_blog'

  - name: 'AWS Japan Blog'
    url: 'https://aws.amazon.com/jp/blogs/news/feed/'
    source_id: 'aws_japan_blog'

  - name: 'AWS Security Blog'
    url: 'https://aws.amazon.com/blogs/security/feed/'
    source_id: 'aws_security_blog'

  - name: 'AWS Security Bulletins'
    url: 'https://aws.amazon.com/security/security-bulletins/rss/feed/'
    source_id: 'aws_security_bulletins'

  - name: 'AWS Architecture Blog'
    url: 'https://aws.amazon.com/jp/blogs/architecture/feed/'
    source_id: 'aws_architecture_blog'

  - name: 'AWS Machine Learning Blog'
    url: 'https://aws.amazon.com/blogs/machine-learning/feed/'
    source_id: 'aws_machine_learning_blog'

  - name: 'AWS Compute Blog'
    url: 'https://aws.amazon.com/blogs/compute/feed/'
    source_id: 'aws_compute_blog'

data_dir: 'data'
output_dir: '_posts'
```

### summary の HTML 表示

フィードの summary には見出しや表を含む HTML が入ることがあります。この HTML はそのまま描画しますが、
素で書き出すと本文中の `<h2>` がページ自身の情報源見出しと同じ要素になり、階層が崩れます。
そのため `main.py` は summary を必ず `.entry-summary` でラップし、CSS 側でフィード本文として
分離できるようにしています。

`config.yaml` の `summary_collapse_threshold`（既定 2000 文字）を超える summary は
`<details>` で折りたたみ、スマートフォンでも見出しを拾いながら読めるようにします。`0` を設定すると折りたたみを無効化できます。

表示側（`src/components/organisms/PostContent.tsx`）での対応:

| 対象       | 内容                                                                                          |
| :--------- | :-------------------------------------------------------------------------------------------- |
| 見出し     | ページ自身の見出しは `& > h2` / `& > h3` と直接の子に限定。本文中の h1〜h6 は一段小さく正規化 |
| 表         | 要素内で横スクロールさせ、ページ全体を押し広げない。セル内のリストも詰める                    |
| `aside`    | 注記ブロックとして左罫線付きで表示                                                            |
| 長い URL   | `overflow-wrap: anywhere` で折り返す                                                          |
| NEW バッジ | `.entry-summary` 内の h3 を除外し、エントリー見出しにのみ付与                                 |

### フィードの追加方法

新しいフィードを追加するには、`feeds` セクションに以下の形式で追加します:

```yaml
feeds:
  - name: '表示名'
    url: 'RSS フィードの URL'
    source_id: '一意な識別子'
```

## 出力形式

### REST API

収集した全エントリーを JSON 形式で取得できます。

- **Endpoint**: `/api/entries/all/index.json`
- **Method**: `GET`
- **Response**: `Entry[]`

### 日別 REST API

特定の日付のエントリーのみを JSON 形式で取得できます。

- **Endpoint**: `/api/entries/[year]/[month]/[day]/index.json`
- **Method**: `GET`
- **Response**: `Entry[]`

**利用例**:

```bash
# 2026年4月24日のエントリーを取得
curl https://gekal-study-knowledge.github.io/aws-feed/api/entries/2026/04/24/index.json
```

**Entry オブジェクトの構造**:

| フィールド   | 型       | 説明                                                |
| :----------- | :------- | :-------------------------------------------------- |
| `id`         | `string` | エントリーの一意識別子 (MD5 ハッシュ)               |
| `title`      | `string` | 記事のタイトル                                      |
| `link`       | `string` | 記事へのリンク                                      |
| `published`  | `string` | 公開日時 (`YYYY-MM-DD HH:MM:SS`)                    |
| `fetched`    | `string` | 取得日時 (`YYYY-MM-DD HH:MM:SS`)                    |
| `summary`    | `string` | 記事の概要 (HTML 形式)                              |
| `sourceId`   | `string` | 情報源の識別子 (例: `aws_whats_new`)                |
| `sourceName` | `string` | 情報源の人間が読みやすい名前 (例: `AWS What's New`) |

**利用例**:

```bash
curl https://gekal-study-knowledge.github.io/aws-feed/api/entries/all/index.json
```

### データファイル (YAML)

各情報源のエントリーは日毎に `data/YYYY/MM/YYYY-MM-DD/` ディレクトリに保存されます:

**例**: `data/2026/03/2026-03-20/aws_whats_new.yaml`

```yaml
entries:
  '03e53c826d6aaecf116c86dbdce0075a':
    'id': '03e53c826d6aaecf116c86dbdce0075a'
    'title': '記事のタイトル'
    'link': 'https://...'
    'published': '2026-03-20 18:38:00'
    'summary': '記事の概要...'
last_updated: '2026-03-21 10:45:50 JST'
```

### 日単位レポート (Markdown)

新規エントリーがあった日付の Markdown が `_posts/YYYY/MM/` に生成されます:

**例**: `_posts/2026/03/2026-03-20-news.md`

```markdown
---
layout: default
title: AWS News - 2026-03-20
news_counter: 15
last_updated: '2026-03-21 10:45:50 JST'
---

# AWS Updates - 2026-03-20

## AWS What's New

### 新機能のタイトル

- **Link**: [https://...](https://...)
- **Published**: 2026-03-20 18:38:00

記事の概要...
```

記事は情報源ごとにグループ化され、各情報源内で公開日順に並びます。

## 既読管理 (Firebase)

日別ページの既読/更新状態を管理します。Google アカウントでログインすると Cloud Firestore に保存され、複数のデバイス・ブラウザ間で既読状態が同期されます。未ログイン時は従来どおりブラウザの localStorage に保存されます（初回ログイン時にローカルの既読を Firestore へマージ）。

### 構成

- **Firebase Authentication (Google)**: 右上のログインアイコンからサインイン
- **Cloud Firestore**: `users/{uid}/reads/{postId}` に既読レコードを保存
- **Firebase プロジェクト**: `aws-feed`

### Firebase 設定値

`src/lib/firebase/config.ts` に公開設定値がフォールバックとして埋め込まれています（Web SDK の設定値はクライアントに配信される公開情報であり、秘匿は不要。セキュリティは Firestore ルールと認可ドメインで担保）。ローカルで上書きする場合は `.env.local`（git 管理外）に `NEXT_PUBLIC_FIREBASE_*` を設定します。

### Firestore セキュリティルール

`firestore.rules` で「認証済みユーザー本人のみ自分の既読データを読み書き可能」に制限しています。デプロイ:

```bash
firebase deploy --only firestore:rules --project aws-feed
```

### Firebase コンソール側の初期設定（実施済み）

- Authentication で **Google** ログインプロバイダを有効化
- 認可ドメインに公開先 `aws.news.gekal.cn`（独自ドメイン）と `gekal-study-knowledge.github.io` を追加（`localhost` は既定で許可）
- Cloud Firestore データベース（`asia-northeast1`）を作成

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
- **Firebase (Auth + Firestore)**: Google ログインと既読状態のクラウド同期

### インフラ

- **GitHub Actions**: 自動実行とデプロイ
- **GitHub Pages**: 静的ホスティング

## スクリプトコマンド

### Python（フィード取得）

```bash
# 新規フィードを取得
python .github/scripts/main.py

# 全レポートを再生成
python .github/scripts/main.py --rebuild
```

### Node.js（開発・ビルド）

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# 静的ファイルのプレビュー
npm run start

# リント
npm run lint

# フォーマット
npm run format
```

## トラブルシューティング

### GitHub Actions でコミットできない

リポジトリの Settings → Actions → General → Workflow permissions を「Read and write permissions」に変更してください。

### フィードが取得できない

- インターネット接続を確認
- フィード URL が正しいか確認
- フィード提供元のステータスを確認

### 重複したエントリーが生成される

エントリー ID は記事のリンクとタイトルから生成されます（MD5 ハッシュ）。フィード側で内容が変更された場合、新規エントリーとして扱われることがあります。

### ビルドエラー

```bash
# 依存パッケージを再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリアしてビルド
rm -rf .next out
npm run build
```

## ライセンス

MIT License
