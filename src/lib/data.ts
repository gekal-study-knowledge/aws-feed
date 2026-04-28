import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { keysToCamelCase } from '../utils/stringUtils';

const dataDirectory = path.join(process.cwd(), 'data');

export interface Entry {
  id: string;
  title: string;
  link: string;
  published: string;
  fetched: string;
  summary: string;
  sourceId: string;
  sourceName: string;
}

export interface YamlData {
  entries: {
    [key: string]: {
      id: string;
      title: string;
      link: string;
      published: string;
      fetched: string;
      summary: string;
    };
  };
  last_updated: string;
}

export interface Config {
  feeds: {
    name: string;
    url: string;
    source_id: string;
  }[];
  data_dir: string;
  output_dir: string;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles;
  }
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.yaml')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

export function getAllEntries(): Entry[] {
  const configPath = path.join(process.cwd(), '.github/scripts/config.yaml');
  let sourceMap: { [key: string]: string } = {};

  try {
    const configContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContents) as Config;
    if (config && config.feeds) {
      config.feeds.forEach((feed) => {
        sourceMap[feed.source_id] = feed.name;
      });
    }
  } catch (e) {
    console.error('Error loading config.yaml:', e);
  }

  const allFiles = getAllFiles(dataDirectory);
  const allEntries: Entry[] = [];

  allFiles.forEach((fullPath) => {
    try {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const data = yaml.load(fileContents) as YamlData;
      const sourceId = path.basename(fullPath, '.yaml');
      const sourceName = sourceMap[sourceId] || sourceId;

      if (data && data.entries) {
        Object.values(data.entries).forEach((entry) => {
          allEntries.push({
            ...(keysToCamelCase(entry as any) as any),
            sourceId: sourceId,
            sourceName: sourceName,
          });
        });
      }
    } catch (e) {
      console.error(`Error parsing ${fullPath}:`, e);
    }
  });

  // 公開日時の降順でソート
  return allEntries.sort((a, b) => (a.published < b.published ? 1 : -1));
}

export function getEntriesByDate(year: string, month: string, day: string): Entry[] {
  const configPath = path.join(process.cwd(), '.github/scripts/config.yaml');
  let sourceMap: { [key: string]: string } = {};

  try {
    const configContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContents) as Config;
    if (config && config.feeds) {
      config.feeds.forEach((feed) => {
        sourceMap[feed.source_id] = feed.name;
      });
    }
  } catch (e) {
    console.error('Error loading config.yaml:', e);
  }

  const targetDir = path.join(dataDirectory, year, month, `${year}-${month}-${day}`);
  if (!fs.existsSync(targetDir)) {
    return [];
  }

  const files = fs.readdirSync(targetDir).filter((file) => file.endsWith('.yaml'));
  const entries: Entry[] = [];

  files.forEach((file) => {
    const fullPath = path.join(targetDir, file);
    try {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const data = yaml.load(fileContents) as YamlData;
      const sourceId = path.basename(file, '.yaml');
      const sourceName = sourceMap[sourceId] || sourceId;

      if (data && data.entries) {
        Object.values(data.entries).forEach((entry) => {
          entries.push({
            ...(keysToCamelCase(entry as any) as any),
            sourceId: sourceId,
            sourceName: sourceName,
          });
        });
      }
    } catch (e) {
      console.error(`Error parsing ${fullPath}:`, e);
    }
  });

  return entries.sort((a, b) => (a.published < b.published ? 1 : -1));
}

export function getAllDates(): { year: string; month: string; day: string }[] {
  const dates: { year: string; month: string; day: string }[] = [];
  if (!fs.existsSync(dataDirectory)) return dates;

  const years = fs.readdirSync(dataDirectory).filter((f) => fs.statSync(path.join(dataDirectory, f)).isDirectory());

  years.forEach((year) => {
    const yearDir = path.join(dataDirectory, year);
    const months = fs.readdirSync(yearDir).filter((f) => fs.statSync(path.join(yearDir, f)).isDirectory());

    months.forEach((month) => {
      const monthDir = path.join(yearDir, month);
      const days = fs.readdirSync(monthDir).filter((f) => fs.statSync(path.join(monthDir, f)).isDirectory());

      days.forEach((dayDir) => {
        // dayDir is in format YYYY-MM-DD
        const match = dayDir.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          dates.push({
            year: match[1],
            month: match[2],
            day: match[3],
          });
        }
      });
    });
  });

  return dates;
}
