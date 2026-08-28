#!/usr/bin/env python3
"""生成した AI 概要を data/YYYY/MM/YYYY-MM-DD/summary.yaml へ書き出す。

入力は次の形の JSON ファイル。overview と topics だけを渡せばよく、
article_count と sources は実データから数え直すので手で書かない
(手で書くと必ずずれる)。

    {
      "days": [
        {
          "date": "2026-08-28",
          "overview": "この日は……",
          "topics": ["カテゴリ: 内容", "カテゴリ: 内容"]
        }
      ]
    }

使い方:
    python .github/scripts/write_summary.py summaries.json
    python .github/scripts/write_summary.py summaries.json --force   # 既存を上書き

既に summary.yaml がある日は既定でスキップする。生成後にエントリーが増えた日を
作り直すときだけ --force を付ける。
"""

import argparse
import datetime
import json
import os
import sys
from pathlib import Path

import yaml

GENERATED_BY = 'AI (Claude Opus 5)'
JST = datetime.timezone(datetime.timedelta(hours=9))


def load_yaml(path):
    with open(path, encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def quote(value):
    """YAML のダブルクォート文字列にする。既存ファイルの書式に合わせる。"""
    return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"') + '"'


def count_entries(directory):
    """その日の記事数と情報源の一覧を実データから数える。"""
    total = 0
    sources = []
    for path in sorted(directory.glob('*.yaml')):
        if path.name == 'summary.yaml':
            continue
        entries = load_yaml(path).get('entries') or {}
        if entries:
            sources.append(path.stem)
            total += len(entries)
    return total, sources


def write_summary(data_dir, item, force):
    date = item['date']
    year, month, _ = date.split('-')
    directory = Path(data_dir) / year / month / date
    output = directory / 'summary.yaml'

    if not directory.is_dir():
        return f'skip   {date} (データなし)'
    if output.exists() and not force:
        return f'skip   {date} (既存: --force で上書き)'

    overview = (item.get('overview') or '').strip()
    topics = list(item.get('topics') or [])
    if not overview:
        return f'skip   {date} (overview が空)'

    count, sources = count_entries(directory)
    now = datetime.datetime.now(JST).strftime('%Y-%m-%d %H:%M:%S JST')

    lines = [
        f'{quote("date")}: {quote(date)}',
        f'{quote("generated_at")}: {quote(now)}',
        f'{quote("generated_by")}: {quote(GENERATED_BY)}',
        f'{quote("article_count")}: {count}',
        f'{quote("sources")}:',
    ]
    lines += [f'  - {quote(s)}' for s in sources]
    lines.append(f'{quote("overview")}: |')
    lines.append('  ' + overview)
    lines.append(f'{quote("topics")}:')
    lines += [f'  - {quote(t)}' for t in topics]

    output.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    verb = 'update' if force else 'write '
    return f'{verb} {date} ({count} 記事 / {len(sources)} ソース / topics {len(topics)} 件)'


def main():
    parser = argparse.ArgumentParser(description='生成した AI 概要を summary.yaml へ書き出す')
    parser.add_argument('payload', help='概要を並べた JSON ファイル')
    parser.add_argument('--config', default='.github/scripts/config.yaml')
    parser.add_argument('--force', action='store_true', help='既存の summary.yaml を上書きする')
    args = parser.parse_args()

    data_dir = 'data'
    if os.path.exists(args.config):
        data_dir = load_yaml(args.config).get('data_dir', 'data')

    with open(args.payload, encoding='utf-8') as f:
        payload = json.load(f)

    days = payload.get('days') or []
    if not days:
        print('days が空です。')
        return 1

    for item in days:
        print(write_summary(data_dir, item, args.force))
    return 0


if __name__ == '__main__':
    sys.exit(main())
