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
