#!/usr/bin/env python3
"""指定日の data/*.yaml から、AI 概要を書くためのダイジェストを作る。

summary.yaml を書くには各エントリーのタイトルと要旨が必要だが、フィードの
summary は HTML で数万文字になることがあり、そのまま読むには大きすぎる。
このスクリプトは HTML を除去して各エントリーを指定文字数に切り詰め、
情報源ごとにまとめた読みやすい形で出力する。

使い方:
    python .github/scripts/summary_digest.py 2026-08-27
    python .github/scripts/summary_digest.py 2026-08-01,2026-08-02 --limit 300
    python .github/scripts/summary_digest.py --stale        # 要対応の日をまとめて
    python .github/scripts/summary_digest.py --missing      # 未生成の日をまとめて

--limit の目安:
    150〜200   1 日のエントリーが多いフィード (AWS など)
    300〜400   1 日数件のフィード (Azure など)
    1200〜1400 1 エントリーに大量の内容が入るフィード (GCP のリリースノート)
"""

import argparse
import html
import os
import re
import sys
from pathlib import Path

import yaml

_TAG = re.compile(r'(?s)<[^>]+>')
# 表やスクリプトは要旨に寄与しないわりに長いので、先に丸ごと落とす
_BLOCK = re.compile(r'(?is)<(script|style|table)[^>]*>.*?</\1>')
_SPACE = re.compile(r'\s+')


def strip_html(text):
    """HTML を落として 1 行の素のテキストにする。"""
    text = _BLOCK.sub(' ', text or '')
    text = _TAG.sub(' ', text)
    return _SPACE.sub(' ', html.unescape(text)).strip()


def load_yaml(path):
    with open(path, encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def day_dir(data_dir, day):
    year, month, _ = day.split('-')
    return Path(data_dir) / year / month / day


def digest(data_dir, day, limit):
    """1 日分のダイジェストを文字列で返す。"""
    directory = day_dir(data_dir, day)
    if not directory.is_dir():
        return f'# {day}  (データなし: {directory})'

    lines = []
    total = 0
    sources = []
    for path in sorted(directory.glob('*.yaml')):
        if path.name == 'summary.yaml':
            continue
        entries = list((load_yaml(path).get('entries') or {}).values())
        if not entries:
            continue
        sources.append(path.stem)
        entries.sort(key=lambda e: e.get('published') or '')
        total += len(entries)
        lines.append(f'## {path.stem} ({len(entries)})')
        for entry in entries:
            body = strip_html(entry.get('summary') or '')[:limit]
            lines.append(f"- {entry.get('title', '')}\n  {body}")

    header = f"# {day}  entries={total}\nsources: {','.join(sources)}"
    return header + '\n' + '\n'.join(lines)


def collect_days(data_dir, status):
    """check_summaries.py と同じ判定で、未生成 / 要対応の日を集める。"""
    sys.path.insert(0, str(Path(__file__).parent))
    from check_summaries import inspect_day, iter_day_dirs  # noqa: E402

    days = []
    for directory in iter_day_dirs(data_dir):
        result = inspect_day(directory)
        if result['status'] in status:
            days.append(directory.name)
    return days


def main():
    parser = argparse.ArgumentParser(description='AI 概要を書くためのダイジェストを作る')
    parser.add_argument('days', nargs='?', help='対象日 (カンマ区切り、YYYY-MM-DD)')
    parser.add_argument('--limit', type=int, default=200, help='1 エントリーの最大文字数')
    parser.add_argument('--config', default='.github/scripts/config.yaml')
    parser.add_argument('--missing', action='store_true', help='概要が未生成の日をすべて対象にする')
    parser.add_argument('--stale', action='store_true', help='生成後に変更があった日をすべて対象にする')
    args = parser.parse_args()

    data_dir = 'data'
    if os.path.exists(args.config):
        data_dir = load_yaml(args.config).get('data_dir', 'data')

    if args.days:
        days = [d.strip() for d in args.days.split(',') if d.strip()]
    else:
        wanted = set()
        if args.missing:
            wanted.add('missing')
        if args.stale:
            wanted.add('stale')
        if not wanted:
            parser.error('対象日を指定するか、--missing / --stale を付けてください')
        days = collect_days(data_dir, wanted)

    if not days:
        print('対象の日付はありません。')
        return 0

    print('\n\n'.join(digest(data_dir, d, args.limit) for d in days))
    return 0


if __name__ == '__main__':
    sys.exit(main())
