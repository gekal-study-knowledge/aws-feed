#!/usr/bin/env python3
"""AI 概要 (summary.yaml) の再生成が必要な日を洗い出す。

各日の summary.yaml に記録された generated_at と、その日の各エントリーの
fetched を突き合わせ、「概要を作った後にフィードから取得されたエントリー」が
ある日を報告する。あわせて summary.yaml が無い日と、article_count が実データと
ずれている日も報告する。

使い方:
    python .github/scripts/check_summaries.py            # 一覧を表示
    python .github/scripts/check_summaries.py --json     # JSON で出力
    python .github/scripts/check_summaries.py --since 2026-08-01
    python .github/scripts/check_summaries.py --quiet    # 終了コードのみ

終了コード: 対応が必要な日があれば 1、なければ 0。
"""

import argparse
import datetime
import json
import os
import sys
from pathlib import Path

import yaml

# generated_at は "YYYY-MM-DD HH:MM:SS JST" と、初期に生成された
# "YYYY-MM-DD JST" の 2 形式が混在する。後者は時刻が不明なため、
# その日の終わり (23:59:59) とみなして誤検知を防ぐ。
_FULL = '%Y-%m-%d %H:%M:%S'
_DATE = '%Y-%m-%d'


def parse_generated_at(value):
    """generated_at を datetime にする。解釈できなければ None。"""
    if not value:
        return None
    text = str(value).replace('JST', '').strip()
    try:
        return datetime.datetime.strptime(text, _FULL)
    except ValueError:
        pass
    try:
        day = datetime.datetime.strptime(text, _DATE)
    except ValueError:
        return None
    return day.replace(hour=23, minute=59, second=59)


def parse_fetched(value):
    """entries の fetched を datetime にする。解釈できなければ None。"""
    if not value:
        return None
    try:
        return datetime.datetime.strptime(str(value).strip()[:19], _FULL)
    except ValueError:
        return None


def load_yaml(path):
    with open(path, encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def iter_day_dirs(data_dir):
    """data/YYYY/MM/YYYY-MM-DD を日付順に返す。"""
    root = Path(data_dir)
    if not root.exists():
        return
    for day_dir in sorted(root.glob('*/*/*')):
        if day_dir.is_dir() and len(day_dir.name) == 10:
            yield day_dir


def inspect_day(day_dir):
    """1 日分を検査して結果の dict を返す。問題が無ければ status='ok'。"""
    entries = []
    sources = []
    for path in sorted(day_dir.glob('*.yaml')):
        if path.name == 'summary.yaml':
            continue
        day_entries = load_yaml(path).get('entries') or {}
        if day_entries:
            sources.append(path.stem)
            entries.extend(day_entries.values())

    result = {
        'date': day_dir.name,
        'path': str(day_dir),
        'entry_count': len(entries),
        'sources': sources,
    }

    summary_path = day_dir / 'summary.yaml'
    if not summary_path.exists():
        result['status'] = 'missing'
        return result

    summary = load_yaml(summary_path)
    generated_at = parse_generated_at(summary.get('generated_at'))
    result['generated_at'] = summary.get('generated_at')
    result['article_count'] = summary.get('article_count')

    # 概要を作った後に取得されたエントリー
    added = []
    if generated_at is not None:
        for entry in entries:
            fetched = parse_fetched(entry.get('fetched'))
            if fetched is not None and fetched > generated_at:
                added.append({
                    'title': entry.get('title', ''),
                    'fetched': entry.get('fetched', ''),
                })
    added.sort(key=lambda x: x['fetched'])
    result['added_after'] = added

    count_mismatch = summary.get('article_count') != len(entries)
    result['count_mismatch'] = count_mismatch

    if generated_at is None:
        result['status'] = 'unparsable'
    elif added or count_mismatch:
        result['status'] = 'stale'
    else:
        result['status'] = 'ok'
    return result


def main():
    parser = argparse.ArgumentParser(description='AI 概要の再生成が必要な日を洗い出す')
    parser.add_argument('--config', default='.github/scripts/config.yaml')
    parser.add_argument('--since', help='この日付以降のみ対象にする (YYYY-MM-DD)')
    parser.add_argument('--json', action='store_true', help='JSON で出力する')
    parser.add_argument('--quiet', action='store_true', help='終了コードのみ返す')
    args = parser.parse_args()

    data_dir = 'data'
    if os.path.exists(args.config):
        data_dir = load_yaml(args.config).get('data_dir', 'data')

    results = []
    for day_dir in iter_day_dirs(data_dir):
        if args.since and day_dir.name < args.since:
            continue
        results.append(inspect_day(day_dir))

    missing = [r for r in results if r['status'] == 'missing']
    stale = [r for r in results if r['status'] == 'stale']
    unparsable = [r for r in results if r['status'] == 'unparsable']
    needs_work = missing + stale + unparsable

    if args.json:
        print(json.dumps({
            'checked': len(results),
            'missing': missing,
            'stale': stale,
            'unparsable': unparsable,
        }, ensure_ascii=False, indent=2))
        return 1 if needs_work else 0

    if args.quiet:
        return 1 if needs_work else 0

    print(f'検査した日付: {len(results)}')

    if missing:
        print(f'\n■ 概要が未生成: {len(missing)} 日')
        for r in missing:
            print(f"  {r['date']}  {r['entry_count']} 記事 / {len(r['sources'])} ソース")

    if stale:
        print(f'\n■ 概要の生成後に変更あり: {len(stale)} 日')
        for r in stale:
            note = []
            if r['count_mismatch']:
                note.append(f"件数 {r['article_count']} → {r['entry_count']}")
            if r['added_after']:
                note.append(f"生成後に取得 {len(r['added_after'])} 件")
            print(f"  {r['date']}  ({', '.join(note)})  概要生成: {r['generated_at']}")
            for entry in r['added_after']:
                print(f"      + [{entry['fetched']}] {entry['title'][:70]}")

    if unparsable:
        print(f'\n■ generated_at を解釈できない: {len(unparsable)} 日')
        for r in unparsable:
            print(f"  {r['date']}  generated_at={r['generated_at']!r}")

    if not needs_work:
        print('\n対応が必要な日はありません。')
    else:
        print(f'\n合計 {len(needs_work)} 日の対応が必要です。')

    return 1 if needs_work else 0


if __name__ == '__main__':
    sys.exit(main())
