#!/usr/bin/env python3
"""
AWS Feed購読システム
RSSフィードを取得し、日単位でまとめてMarkdownを生成します。
"""

import feedparser
import yaml
import os
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Any
import hashlib
import argparse


def load_config(config_path: str = "config.yaml") -> Dict[str, Any]:
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


def load_daily_data(entry_date: date, source_id: str, data_dir: str) -> Dict[str, Any]:
    """日毎・情報源ごとのYAMLデータを読み込む"""
    date_dir = Path(data_dir) / entry_date.isoformat()
    data_file = date_dir / f"{source_id}.yaml"
    if data_file.exists():
        with open(data_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    return {}


def save_daily_data(entry_date: date, source_id: str, data: Dict[str, Any], data_dir: str):
    """日毎・情報源ごとのYAMLデータを保存する"""
    date_dir = Path(data_dir) / entry_date.isoformat()
    date_dir.mkdir(parents=True, exist_ok=True)
    data_file = date_dir / f"{source_id}.yaml"
    with open(data_file, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)


def load_all_existing_ids(source_id: str, data_dir: str) -> set:
    """特定の情報源の全ての既存エントリーIDを読み込む"""
    existing_ids = set()
    data_path = Path(data_dir)
    if not data_path.exists():
        return existing_ids

    # 全ての日付ディレクトリを走査
    for date_dir in data_path.iterdir():
        if date_dir.is_dir():
            data_file = date_dir / f"{source_id}.yaml"
            if data_file.exists():
                with open(data_file, 'r', encoding='utf-8') as f:
                    daily_data = yaml.safe_load(f) or {}
                    entries = daily_data.get('entries', {})
                    existing_ids.update(entries.keys())

    return existing_ids


def parse_entry_date(entry: Any) -> date:
    """エントリーの日付を解析する"""
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        dt = datetime(*entry.published_parsed[:6])
        return dt.date()
    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        dt = datetime(*entry.updated_parsed[:6])
        return dt.date()
    else:
        return date.today()


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

    for entry in feed.entries:
        entry_id = generate_entry_id(entry)

        if entry_id not in existing_ids:
            entry_date = parse_entry_date(entry)
            entry_data = {
                'id': entry_id,
                'title': entry.get('title', ''),
                'link': entry.get('link', ''),
                'published': entry_date.isoformat(),
                'summary': entry.get('summary', '')
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
        daily_data['last_updated'] = datetime.now().isoformat()

        # 保存
        save_daily_data(entry_date, source_id, daily_data, data_dir)

    return new_entries, updated_dates


def generate_daily_markdown(entry_date: date, data_dir: str, config: Dict[str, Any], output_dir: str):
    """YAMLデータから日単位のMarkdownファイルを生成する"""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    output_file = Path(output_dir) / f"{entry_date.isoformat()}.md"

    # 該当日付の全情報源のYAMLデータを読み込む
    entries_by_source = {}

    for feed_config in config['feeds']:
        source_id = feed_config['source_id']
        source_name = feed_config['name']

        daily_data = load_daily_data(entry_date, source_id, data_dir)
        if daily_data.get('entries'):
            entries = []
            for entry_id, entry_data in daily_data['entries'].items():
                entries.append(entry_data)

            # 公開日順にソート
            entries.sort(key=lambda x: x['published'])
            entries_by_source[source_name] = entries

    if not entries_by_source:
        return

    # Markdownコンテンツを生成
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"# AWS Updates - {entry_date.isoformat()}\n\n")

        for source_name, source_entries in entries_by_source.items():
            f.write(f"## {source_name}\n\n")
            for entry in source_entries:
                f.write(f"### {entry['title']}\n\n")
                f.write(f"- **Link**: {entry['link']}\n")
                f.write(f"- **Published**: {entry['published']}\n\n")
                if entry.get('summary'):
                    f.write(f"{entry['summary']}\n\n")
                f.write("---\n\n")

    print(f"Generated: {output_file}")


def generate_html_from_yaml(entry_date: date, data_dir: str, config: Dict[str, Any], html_file: Path):
    """YAMLデータから直接HTMLを生成する"""
    # 該当日付の全情報源のYAMLデータを読み込む
    entries_by_source = {}

    for feed_config in config['feeds']:
        source_id = feed_config['source_id']
        source_name = feed_config['name']

        daily_data = load_daily_data(entry_date, source_id, data_dir)
        if daily_data.get('entries'):
            entries = []
            for entry_id, entry_data in daily_data['entries'].items():
                entries.append(entry_data)

            # 公開日順にソート
            entries.sort(key=lambda x: x['published'])
            entries_by_source[source_name] = entries

    # HTMLコンテンツを生成
    html_content = f'<h1>AWS Updates - {entry_date.isoformat()}</h1>\n\n'

    for source_name, entries in entries_by_source.items():
        html_content += f'<h2>{source_name}</h2>\n\n'
        for entry in entries:
            html_content += f'<h3>{entry["title"]}</h3>\n\n'
            html_content += f'<ul>\n'
            html_content += f'<li><strong>Link</strong>: <a href="{entry["link"]}">{entry["link"]}</a></li>\n'
            html_content += f'<li><strong>Published</strong>: {entry["published"]}</li>\n'
            html_content += f'</ul>\n\n'
            if entry.get('summary'):
                html_content += f'<p>{entry["summary"]}</p>\n\n'
            html_content += f'<hr>\n\n'

    # HTMLテンプレートを作成
    html_template = f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWS Updates - {entry_date.isoformat()}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>AWS Updates Feed</h1>
            <p class="subtitle"><a href="index.html">← トップに戻る</a></p>
        </header>
        <main class="report-content">
            {html_content}
        </main>
        <footer>
            <p>自動更新: 1時間ごと | <a href="https://github.com/gekal-study-knowledge/aws-feed" target="_blank">GitHub</a></p>
        </footer>
    </div>
</body>
</html>"""

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_template)


def generate_reports_index(data_dir: str, docs_dir: str, config: Dict[str, Any], updated_dates: set = None):
    """YAMLデータからHTMLを生成し、インデックスページを作成する。updated_datesが指定されている場合は該当日のみ更新。"""
    Path(docs_dir).mkdir(parents=True, exist_ok=True)

    data_path = Path(data_dir)
    reports = []

    if data_path.exists():
        # 全ての日付ディレクトリを取得
        date_dirs = sorted([d for d in data_path.iterdir() if d.is_dir()], reverse=True)

        for date_dir in date_dirs:
            date_str = date_dir.name

            try:
                entry_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                continue

            # updated_datesが指定されている場合、該当日のみ処理
            if updated_dates is not None and entry_date not in updated_dates:
                # 既存HTMLがある場合はエントリー数だけカウント
                html_file = Path(docs_dir) / f"{date_str}.html"
                if html_file.exists():
                    # エントリー数を計算
                    entry_count = count_entries_for_date(entry_date, data_dir, config)
                    reports.append({
                        'date': date_str,
                        'filename': f"{date_str}.html",
                        'count': entry_count
                    })
                continue

            # HTMLファイルを生成
            html_file = Path(docs_dir) / f"{date_str}.html"
            generate_html_from_yaml(entry_date, data_dir, config, html_file)
            print(f"Generated: {html_file}")

            # エントリー数を計算
            entry_count = count_entries_for_date(entry_date, data_dir, config)

            reports.append({
                'date': date_str,
                'filename': f"{date_str}.html",
                'count': entry_count
            })

    # インデックスページを生成
    index_html = generate_index_html(reports)
    index_file = Path(docs_dir) / 'index.html'
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(index_html)
    print(f"Generated: {index_file}")


def count_entries_for_date(entry_date: date, data_dir: str, config: Dict[str, Any]) -> int:
    """特定の日付のエントリー数をカウントする"""
    total_count = 0
    for feed_config in config['feeds']:
        source_id = feed_config['source_id']
        daily_data = load_daily_data(entry_date, source_id, data_dir)
        if daily_data.get('entries'):
            total_count += len(daily_data['entries'])
    return total_count


def generate_index_html(reports: List[Dict[str, Any]]) -> str:
    """インデックスHTMLを生成する"""
    reports_html = ""

    if not reports:
        reports_html = '<p class="no-reports">レポートがありません</p>'
    else:
        reports_html = '<div class="reports-grid">'
        for report in reports:
            date_obj = datetime.strptime(report['date'], '%Y-%m-%d').date()
            formatted_date = date_obj.strftime('%Y年%m月%d日')
            weekday = ['月', '火', '水', '木', '金', '土', '日'][date_obj.weekday()]

            reports_html += f"""
                <div class="report-card">
                    <div class="report-date">{formatted_date} ({weekday})</div>
                    <div class="report-count">{report['count']}件の更新</div>
                    <a href="{report['filename']}" class="report-link">レポートを見る →</a>
                </div>
            """
        reports_html += '</div>'

    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWS Updates Feed</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>AWS Updates Feed</h1>
            <p class="subtitle">AWS公式フィードの日次まとめ</p>
        </header>
        <main>
            {reports_html}
        </main>
        <footer>
            <p>最終更新: {datetime.now().strftime('%Y年%m月%d日 %H:%M')} | 自動更新: 1時間ごと | <a href="https://github.com/gekal-study-knowledge/aws-feed" target="_blank">GitHub</a></p>
        </footer>
    </div>
</body>
</html>"""


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description='AWS Feed購読システム')
    parser.add_argument('--rebuild', action='store_true', help='全ての既存データからレポートを再生成する')
    args = parser.parse_args()

    # 設定を読み込む
    config = load_config()
    data_dir = config.get('data_dir', 'data')
    output_dir = config.get('output_dir', '_posts')
    docs_dir = config.get('docs_dir', 'docs')

    all_updated_dates = set()
    all_new_entries = []

    if args.rebuild:
        print("Rebuilding all reports from existing data...")
        data_path = Path(data_dir)
        if data_path.exists():
            for date_dir in data_path.iterdir():
                if date_dir.is_dir():
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

    # GitHub Pages用のHTMLを生成
    if all_updated_dates:
        print(f"\nUpdating HTML for dates: {sorted([d.isoformat() for d in all_updated_dates])}")
        generate_reports_index(data_dir, docs_dir, config, all_updated_dates if not args.rebuild else None)
    else:
        # 更新がない場合でもインデックスページは生成（初回実行時など）
        generate_reports_index(data_dir, docs_dir, config)


if __name__ == '__main__':
    main()
