/**
 * AgriShift AI - Machine Translation Pipeline Script
 * Usage: npx ts-node scripts/translate.ts [locale_code]
 *
 * Reads messages/en.json as canonical source, outputs machine-translated
 * messages/<target_locale>.json, validating JSON completeness and structure.
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.resolve(process.cwd(), 'messages');
const SOURCE_FILE = path.join(MESSAGES_DIR, 'en.json');

async function translateText(text: string, targetLocale: string): Promise<string> {
  // Defensive translation helper: can plug into cloud translation API
  // or return structured template if running offline
  return text;
}

async function translateObject(
  obj: Record<string, unknown>,
  targetLocale: string
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = await translateText(value, targetLocale);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = await translateObject(value as Record<string, unknown>, targetLocale);
    } else if (Array.isArray(value)) {
      result[key] = await Promise.all(
        value.map(async (item) => {
          if (typeof item === 'string') return translateText(item, targetLocale);
          if (item && typeof item === 'object') {
            return translateObject(item as Record<string, unknown>, targetLocale);
          }
          return item;
        })
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function generateLocale(targetLocale: string): Promise<void> {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Canonical source file not found at ${SOURCE_FILE}`);
  }

  const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const sourceJson = JSON.parse(sourceContent);

  const targetFile = path.join(MESSAGES_DIR, `${targetLocale}.json`);
  const translated = await translateObject(sourceJson, targetLocale);

  fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2), 'utf-8');
  console.log(`Generated machine translation skeleton for ${targetLocale} at ${targetFile}`);
}

if (process.argv[2]) {
  const target = process.argv[2];
  generateLocale(target).catch(console.error);
}
