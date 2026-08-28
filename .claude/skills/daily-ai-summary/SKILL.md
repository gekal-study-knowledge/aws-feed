---
name: daily-ai-summary
description: このリポジトリの日別ページに載る「AI による概要」(data/YYYY/MM/YYYY-MM-DD/summary.yaml) を生成・更新する手順。概要が未生成の日を埋めるとき、フィードが後からエントリーを追加して概要が古くなった日を作り直すとき、check_summaries.py が「対応が必要な日」を報告したときに使う。AI 概要 / summary.yaml / DailySummary / 日次サマリー / 概要の再生成 / generated_at / 記事数のズレ の話題が出たら、明示されなくても参照すること。
---

# AI による概要の生成・更新

日別ページ冒頭の「AI による概要」は `data/YYYY/MM/YYYY-MM-DD/summary.yaml` に置かれ、
`src/lib/data.ts` の `getDailySummary()` が読み、`DailySummary` が描画する。
**このファイルは自動生成されない。モデル (あなた) が本文を書く。**

## 実行環境

コマンドはすべて **`python3`** で書いてある。macOS には `python` が無く
(Homebrew の Python は `python3` のみを入れる)、`python` で実行すると
`command not found` になる。

依存は `.github/scripts/requirements.txt` の PyYAML。入っていなければ入れる。

```bash
python3 -m pip install -r .github/scripts/requirements.txt
```

## 1. 対象日を洗い出す

最初に必ず実行する。手当たり次第に作らない。

```bash
python3 .github/scripts/check_summaries.py
```

3 つの状態を報告する。終了コードは、対応が必要な日があれば 1、なければ 0。

| 状態                        | 対応                                                   |
| :-------------------------- | :----------------------------------------------------- |
| 概要が未生成                | 新規に書く                                             |
| 概要の生成後に変更あり      | 作り直す (`--force`)。増えたエントリーが一覧に出ている |
| generated_at を解釈できない | `summary.yaml` を直接見て原因を確かめる                |

対象を絞りたいときは `--since 2026-08-01`、機械的に扱いたいときは `--json`。

**「対応が必要な日はありません」なら何もしない。** 既存の概要を作り直す必要はない。

## 2. ダイジェストを読む

フィードの `summary` は HTML で数万文字になることがあり、そのままでは読めない。
`summary_digest.py` が HTML を落として情報源ごとに切り詰めた形にする。

```bash
python3 .github/scripts/summary_digest.py 2026-08-27,2026-08-28 --limit 200
python3 .github/scripts/summary_digest.py --missing --limit 200   # 未生成の日をまとめて
python3 .github/scripts/summary_digest.py --stale                 # 要対応の日をまとめて
```

`--limit` はフィードの性格で変える。**ここを誤ると読み込み量が跳ね上がる。**

| フィードの性格                                      | 目安       |
| :-------------------------------------------------- | :--------- |
| 1 日のエントリーが多い (AWS の What's New など)     | 150〜200   |
| 1 日数件で 1 件が短い (Azure Updates など)          | 300〜400   |
| 1 エントリーに大量の内容 (GCP のリリースノートなど) | 1200〜1400 |

出力が大きいときはファイルに落として読む。1 回で扱う日数は、
**出力が 30〜50KB に収まる範囲**を目安にする (エントリーの多い日なら 7 日程度、
少ない日なら 30 日程度)。

## 3. 概要を書く

`overview` と `topics` だけを書く。**`article_count` と `sources` は書かない**
(スクリプトが実データから数える。手で書くと必ずずれる)。

```json
{
  "days": [
    {
      "date": "2026-08-28",
      "overview": "この日は……",
      "topics": ["カテゴリ: 内容", "カテゴリ: 内容"]
    }
  ]
}
```

### overview

- **日本語の地の文 1 段落**。300〜500 字程度。箇条書きにしない
- 「この日は〜が中心でした」のように、その日の主題を最初に置く
- 個別の発表を羅列するのではなく、**関連するものをまとめて意味づける**
- 数値・バージョン・リージョン名など、記事にある具体を落とさない
- 更新が 1〜2 件しかない日は無理に膨らませず、短くてよい

### topics

- `カテゴリ: 内容` の形。3〜8 件
- カテゴリは「セキュリティ」「データベース」「国内」のように内容から付ける。
  情報源名 (`aws_whats_new` など) をそのまま使わない
- 1 行で読み切れる長さにする

### 書くときの注意

- **ダイジェストに書かれていないことを足さない。** 製品の一般知識で補完しない
- 廃止・終了の告知は日付を落とさない (「2027-08-30 に提供終了」)
- 脆弱性は CVE 番号を残す
- 同じ内容が複数の情報源に重複して出ることがある。1 つにまとめる
- 既存の概要を作り直すときは、**元の文章が今も正しいなら活かす**。
  増えたエントリーの分だけ足りない場合は、追記で済ませてよい

## 4. 書き出す

```bash
python3 .github/scripts/write_summary.py /tmp/summaries.json           # 新規
python3 .github/scripts/write_summary.py /tmp/summaries.json --force   # 作り直し
```

`--force` を付けない限り既存ファイルは上書きしない。**新規の日に誤って `--force` を
付けても害はないが、既存を作り直す意図がないなら付けない。**

`generated_at` は実行時刻が**秒まで**記録される。これが次回の
`check_summaries.py` の判定基準になるので、**手で書き換えない**。

## 5. 確認する

```bash
python3 .github/scripts/check_summaries.py   # 「対応が必要な日はありません」になること
npm run build                                # ビルドが通ること
```

表示まで見るなら `out/` を配信して該当ページを開く。

```bash
(cd out && python3 -m http.server 4173) &
curl -sL http://localhost:4173/posts/2026/08/28/news/ | grep -o 'AI による概要'
```

## 6. コミットする

`data/**/summary.yaml` だけが変更対象になっているか確認してからコミットする。
毎時のフィード取得ジョブと競合しやすいので、**作業前に `git pull` する**。

## よくある落とし穴

- **毎時ジョブが並行して動く。** 概要を書いている間にエントリーが増えることがある。
  コミット直前にもう一度 `check_summaries.py` を回す
- **`generated_at` が日付のみの古い概要がある。** 初期に生成された分は
  `"2026-07-04 JST"` という形式で時刻を持たない。`check_summaries.py` は
  その日の 23:59:59 とみなして比較するので、そのままでよい
- **`article_count` を手で直さない。** `write_summary.py` が数え直す
- **1 日ずつ小刻みに書き出さない。** 数日〜数十日をまとめて 1 つの JSON にする
