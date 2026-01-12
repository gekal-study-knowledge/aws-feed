# AWS Feed 購読システム

AWS公式のRSSフィードを自動的に購読し、日単位でまとめたMarkdownレポートを生成するシステムです。

## 機能

- **自動フィード取得**: AWS What's New、AWS News Blog、AWS Security Blogなど複数のフィードを取得
- **変更検出**: 新規エントリーのみを検出して処理
- **日単位レポート**: 新しい情報が公開された日ごとにMarkdownファイルを生成
- **GitHub Actions連携**: 1時間ごとに自動実行し、変更を自動コミット

## ディレクトリ構成

```
aws-feed/
├── .github/
│   └── workflows/
│       └── fetch-feeds.yml    # GitHub Actionsワークフロー
├── config.yaml                # フィード設定ファイル
├── main.py                    # メインプログラム
├── requirements.txt           # Python依存パッケージ
├── data/                      # 日毎・情報源ごとのYAMLデータ (自動生成)
│   ├── 2026-01-12/
│   │   ├── aws_whats_new.yaml
│   │   ├── aws_news_blog.yaml
│   │   └── aws_security_blog.yaml
│   ├── 2026-01-13/
│   │   ├── aws_whats_new.yaml
│   │   └── aws_news_blog.yaml
│   └── ...
└── daily_reports/             # 日単位のMarkdownレポート (自動生成)
    ├── 2026-01-12.md
    ├── 2026-01-13.md
    └── ...
```

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd aws-feed
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. ローカルでの実行

```bash
python main.py
```

初回実行時は全エントリーが新規として扱われ、日単位のMarkdownが生成されます。

## GitHub Actionsでの自動実行

### 設定方法

1. GitHubリポジトリにコードをプッシュ
2. リポジトリの Settings → Actions → General で、Workflow permissionsを「Read and write permissions」に設定

### 実行スケジュール

- **自動実行**: 1時間ごと(毎時0分)
- **手動実行**: GitHubのActionsタブから「Fetch AWS Feeds」ワークフローを選択し、「Run workflow」をクリック

### 動作フロー

1. フィードを取得
2. 新規エントリーを検出
3. YAMLデータを更新 (`data/`)
4. 日単位のMarkdownを生成 (`daily_reports/`)
5. 変更を自動コミット&プッシュ

## 設定ファイル (config.yaml)

```yaml
feeds:
  - name: "AWS What's New"
    url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/"
    source_id: "aws_whats_new"

  - name: "AWS News Blog"
    url: "https://aws.amazon.com/blogs/aws/feed/"
    source_id: "aws_news_blog"

  - name: "AWS Security Blog"
    url: "https://aws.amazon.com/blogs/security/feed/"
    source_id: "aws_security_blog"

data_dir: "data"
output_dir: "daily_reports"
```

### フィードの追加方法

新しいフィードを追加するには、`config.yaml`の`feeds`セクションに以下の形式で追加します:

```yaml
feeds:
  - name: "表示名"
    url: "RSSフィードのURL"
    source_id: "一意な識別子"
```

## 出力形式

### データファイル (YAML)

各情報源のエントリーは日毎に `data/YYYY-MM-DD/` ディレクトリに保存されます:

**例**: `data/2026-01-12/aws_whats_new.yaml`

```yaml
entries:
  abc123def456:
    id: abc123def456
    title: "記事のタイトル"
    link: "https://..."
    published: "2026-01-12"
    summary: "記事の概要"
  def789ghi012:
    id: def789ghi012
    title: "別の記事のタイトル"
    link: "https://..."
    published: "2026-01-12"
    summary: "別の記事の概要"
last_updated: "2026-01-12T10:30:00"
```

### 日単位レポート (Markdown)

新規エントリーがあった日付のMarkdownが `daily_reports/` に生成されます:

```markdown
# AWS Updates - 2026-01-12

## AWS What's New

### 新機能のタイトル

- **Link**: https://...
- **Published**: 2026-01-12

記事の概要...

---
```

記事は情報源ごとにグループ化され、各情報源内で公開日順に並びます。

## 技術スタック

- **Python 3.11+**
- **feedparser**: RSSフィード解析
- **PyYAML**: YAML読み書き
- **GitHub Actions**: 自動実行とデプロイ

## ライセンス

MIT License

## トラブルシューティング

### GitHub Actionsでコミットできない

リポジトリの Settings → Actions → General → Workflow permissions を「Read and write permissions」に変更してください。

### フィードが取得できない

- インターネット接続を確認
- フィードURLが正しいか確認
- フィード提供元のステータスを確認

### 重複したエントリーが生成される

エントリーIDは記事のリンクとタイトルから生成されます。フィード側で内容が変更された場合、新規エントリーとして扱われることがあります。
