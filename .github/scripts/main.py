#!/usr/bin/env python3
"""
AWS Feed購読システム
RSSフィードを取得し、日単位でまとめてMarkdownを生成します。
"""

import feedparser
import yaml
import os
from datetime import datetime, date, timedelta, timezone
from pathlib import Path
from typing import List, Dict, Any
import hashlib
import argparse


def load_config(config_path: str = ".github/scripts/config.yaml") -> Dict[str, Any]:
    """設定ファイルを読み込む"""
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def fetch_feed(url: str) -> feedparser.FeedParserDict:
    """RSSフィードを取得してパースする"""
    print(f"Fetching feed from: {url}")
    feed = feedparser.parse(url)
    return feed


def generate_entry_id(entry: Any) -> str:
    """エントリーの一意なIDを生成する"""
    # link + titleでハッシュを生成
    content = f"{entry.get('link', '')}{entry.get('title', '')}"
    return hashlib.md5(content.encode()).hexdigest()


def get_date_path(entry_date: date) -> str:
    """日付から年/月のパスを生成する"""
    return os.path.join(str(entry_date.year), f"{entry_date.month:02d}")


def load_daily_data(entry_date: date, source_id: str, data_dir: str) -> Dict[str, Any]:
    """日毎・情報源ごとのYAMLデータを読み込む"""
    date_path = get_date_path(entry_date)
    date_dir = Path(data_dir) / date_path / entry_date.isoformat()
    data_file = date_dir / f"{source_id}.yaml"
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    return {}


def save_daily_data(entry_date: date, source_id: str, data: Dict[str, Any], data_dir: str):
    """日毎・情報源ごとのYAMLデータを保存する"""
    date_path = get_date_path(entry_date)
    date_dir = Path(data_dir) / date_path / entry_date.isoformat()
    date_dir.mkdir(parents=True, exist_ok=True)
    data_file = date_dir / f"{source_id}.yaml"
    with open(data_file, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False, width=float('inf'), default_style='"')


def load_all_existing_ids(source_id: str, data_dir: str) -> set:
    """特定の情報源の全ての既存エントリーIDを読み込む"""
    existing_ids = set()
    data_path = Path(data_dir)
    if not data_path.exists():
        return existing_ids

    # 全ての日付ディレクトリを再帰的に走査
    for yaml_file in data_path.rglob(f"{source_id}.yaml"):
        with open(yaml_file, 'r', encoding='utf-8') as f:
            daily_data = yaml.safe_load(f) or {}
            entries = daily_data.get('entries', {})
            existing_ids.update(entries.keys())

    return existing_ids


def parse_entry_datetime(entry: Any) -> datetime:
    """エントリーの公開日時を解析する。JSTを前提とする。
    
    解析の優先順位:
    1. published_parsed (time.struct_time形式)
    2. updated_parsed (time.struct_time形式)
    3. 時刻を取得できない場合はデフォルトで00:00:00を使う
    """
    # published_parsedまたはupdated_parsedから時刻を取得
    time_struct = None
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        time_struct = entry.published_parsed
    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        time_struct = entry.updated_parsed
    
    if time_struct:
        # time.struct_time から datetime を生成 (最初の6要素を使用)
        return datetime(*time_struct[:6])
    else:
        # フォールバック：今日の日付で00:00:00を返す
        return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)


def parse_entry_date(entry: Any) -> date:
    """エントリーの日付を解析する"""
    dt = parse_entry_datetime(entry)
    return dt.date()


def get_jst_now() -> datetime:
    """JSTの現在時刻を取得する"""
    return datetime.now(timezone(timedelta(hours=9)))


def process_feed(feed_config: Dict[str, str], data_dir: str) -> tuple[List[Dict[str, Any]], set]:
    """フィードを処理して新規エントリーを抽出する。更新があった日付も返す。"""
    source_id = feed_config['source_id']
    feed = fetch_feed(feed_config['url'])

    # 既存の全エントリーIDを読み込む
    existing_ids = load_all_existing_ids(source_id, data_dir)

    # 新規エントリーを検出し、日付ごとに分類
    new_entries = []
    entries_by_date = {}
    updated_dates = set()

    fetched_at = get_jst_now().strftime('%Y-%m-%d %H:%M:%S')
    for entry in feed.entries:
        entry_id = generate_entry_id(entry)

        if entry_id not in existing_ids:
            entry_datetime = parse_entry_datetime(entry)
            entry_date = entry_datetime.date()
            entry_data = {
                'id': entry_id,
                'title': entry.get('title', ''),
                'link': entry.get('link', ''),
                'published': entry_datetime.strftime('%Y-%m-%d %H:%M:%S'),
                'fetched': fetched_at,
                'summary': entry.get('summary', '') or entry.get('description', '')
            }

            # 日付ごとに分類
            if entry_date not in entries_by_date:
                entries_by_date[entry_date] = {}

            entries_by_date[entry_date][entry_id] = entry_data
            updated_dates.add(entry_date)

            new_entries.append({
                'source_name': feed_config['name'],
                'source_id': source_id,
                'date': entry_date,
                **entry_data
            })

    # 日付ごとにデータを保存
    for entry_date, entries_dict in entries_by_date.items():
        # 既存の日次データを読み込む
        daily_data = load_daily_data(entry_date, source_id, data_dir)

        # 既存エントリーに新規エントリーを追加
        if 'entries' not in daily_data:
            daily_data['entries'] = {}
        daily_data['entries'].update(entries_dict)
        daily_data['last_updated'] = get_jst_now().strftime('%Y-%m-%d %H:%M:%S JST')

        # 保存
        save_daily_data(entry_date, source_id, daily_data, data_dir)

    return new_entries, updated_dates


def generate_daily_markdown(entry_date: date, data_dir: str, config: Dict[str, Any], output_dir: str):
    """YAMLデータから日単位のMarkdownファイルを生成する"""
    date_path = get_date_path(entry_date)
    target_dir = Path(output_dir) / date_path
    target_dir.mkdir(parents=True, exist_ok=True)
    output_file = target_dir / f"{entry_date.isoformat()}-news.md"

    # 該当日付の全情報源のYAMLデータを読み込む
    entries_by_source = {}
    last_updated_list = []
    all_published_dates = []

    for feed_config in config['feeds']:
        source_id = feed_config['source_id']
        source_name = feed_config['name']

        daily_data = load_daily_data(entry_date, source_id, data_dir)
        if daily_data.get('entries'):
            entries = []
            for entry_id, entry_data in daily_data['entries'].items():
                entries.append(entry_data)
                if entry_data.get('published'):
                    all_published_dates.append(entry_data['published'])

            # 公開日順にソート
            entries.sort(key=lambda x: x['published'])
            entries_by_source[source_name] = entries

            if daily_data.get('last_updated'):
                last_updated_list.append(daily_data['last_updated'])

    if not entries_by_source:
        return

    # last_updatedの決定
    # 1. YAMLに保存されているlast_updatedがある場合、最新のものを使う
    # 2. 無い場合、全エントリーのpublishedの最大値を "YYYY-MM-DD 00:00:00 JST" 形式で作成
    if last_updated_list:
        # 文字列比較で最新を取得
        raw_latest = max(last_updated_list)
        # ISO形式 (2026-03-02T07:47:09...) の場合は JST 形式に変換を試みる
        if 'T' in raw_latest and ' JST' not in raw_latest:
            try:
                # 2026-03-02T07:47:09.975456 -> 2026-03-02 07:47:09 JST
                dt = datetime.fromisoformat(raw_latest)
                last_updated = dt.strftime('%Y-%m-%d %H:%M:%S JST')
            except ValueError:
                last_updated = raw_latest
        else:
            last_updated = raw_latest
    elif all_published_dates:
        latest_pub = max(all_published_dates)
        # 既存分は feed の最後の日付とのことなので、published の最大値を使う。時間はとりあえず 00:00:00 JST か 23:59:59 JST?
        # ユーザーの例が 21:40:01 なので、特に指定がなければ 00:00:00 とかで良さそう。
        last_updated = f"{latest_pub} 00:00:00 JST"
    else:
        last_updated = get_jst_now().strftime('%Y-%m-%d %H:%M:%S JST')

    # Markdownコンテンツを生成
    total_entries = sum(len(entries) for entries in entries_by_source.values())

    with open(output_file, 'w', encoding='utf-8') as f:
        # YAML Front Matter
        f.write("---\n")
        f.write("layout: default\n")
        f.write(f"title: AWS News - {entry_date.isoformat()}\n")
        f.write(f"news_counter: {total_entries}\n")
        f.write(f"last_updated: {last_updated}\n")
        f.write("---\n\n")

        f.write(f"# AWS Updates - {entry_date.isoformat()}\n\n")

        for source_name, source_entries in entries_by_source.items():
            f.write(f"## {source_name}\n\n")
            for i, entry in enumerate(source_entries):
                f.write(f"### {entry['title']}\n\n")
                f.write(f"- **Link**: [{entry['link']}]({entry['link']})\n")
                
                # 公開日時のフォーマット確認（YYYY-MM-DD HH:MM:SS 形式を保証）
                published = entry['published']
                if not published or len(published) < 19:  # YYYY-MM-DD HH:MM:SS の長さは19
                    if len(published) == 10:  # YYYY-MM-DD のみの場合
                        published = f"{published} 00:00:00"
                    else:
                        published = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                f.write(f"- **Published**: {published}\n")

                fetched = entry.get('fetched', '')
                if not fetched or len(fetched) < 19:  # YYYY-MM-DD HH:MM:SS の長さは19
                    if len(published) == 10:  # YYYY-MM-DD のみの場合
                        fetched = f"{fetched} 00:00:00"
                    else:
                        fetched = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    f.write(f"- **Fetched**: {fetched}\n")
                f.write("\n")
                if entry.get('summary'):
                    f.write(f"{entry['summary']}\n\n")

    print(f"Generated: {output_file}")



def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description='AWS Feed購読システム')
    parser.add_argument('--rebuild', action='store_true', help='全ての既存データからレポートを再生成する')
    args = parser.parse_args()

    # 設定を読み込む
    config = load_config()
    data_dir = config.get('data_dir', 'data')
    output_dir = config.get('output_dir', '_posts')

    all_updated_dates = set()
    all_new_entries = []

    if args.rebuild:
        print("Rebuilding all reports from existing data...")
        data_path = Path(data_dir)
        if data_path.exists():
            # 再帰的に日付ディレクトリを探す
            for date_dir in data_path.rglob("*"):
                if date_dir.is_dir() and len(date_dir.name) == 10:
                    try:
                        entry_date = datetime.strptime(date_dir.name, '%Y-%m-%d').date()
                        all_updated_dates.add(entry_date)
                    except ValueError:
                        continue
    else:
        # 全ての新規エントリーと更新された日付を収集
        for feed_config in config['feeds']:
            new_entries, updated_dates = process_feed(feed_config, data_dir)
            all_new_entries.extend(new_entries)
            all_updated_dates.update(updated_dates)
            print(f"Found {len(new_entries)} new entries from {feed_config['name']}")

    # Markdownを生成（更新があった日付、または全日付）
    if all_updated_dates:
        for entry_date in sorted(all_updated_dates):
            generate_daily_markdown(entry_date, data_dir, config, output_dir)
        
        if not args.rebuild:
            print(f"\nTotal: {len(all_new_entries)} new entries processed")
    else:
        if not args.rebuild:
            print("\nNo new entries found")

if __name__ == '__main__':
    main()
