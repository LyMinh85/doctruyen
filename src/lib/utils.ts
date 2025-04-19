import { TranslationService } from "@/services/translate-service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import pako from 'pako';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_AVATAR_URL = "/default-avatar.jpg";

export enum DictFilePath {
  names = "/dicts/Names.txt",
  compressedNames = "/dicts/Names.txt.gz",
  names2 = "/dicts/Names2.txt",
  vietphrase = "/dicts/VietPhrase.txt",
  hanViet = "/dicts/ChinesePhienAmWords.txt",
  luatNhan = "/dicts/LuatNhan.txt",
  vietphraseQuickTranslator = "/dicts/VietPhraseQuickTranslator.txt",
  compressedVietphraseQuickTranslator = "/dicts/VietPhraseQuickTranslator.txt.gz",
  // "/dicts/cautruc.txt",
}

/**
 * Loads a dictionary file by its path in a client environment.
 *
 * This function fetches a dictionary file from the specified path and
 * parses it using the TranslationService.parseDictionaryFile method.
 *
 * @param dictFilePath - The path to the dictionary file to load
 * @returns A Promise that resolves to a Record mapping keys to translated strings
 * @async
 */
export const loadDictionaryByNameInClient = async (
  dictFilePath: DictFilePath
): Promise<Record<string, string>> => {
  const res = await fetch(dictFilePath);
  if (dictFilePath === DictFilePath.compressedVietphraseQuickTranslator
    || dictFilePath === DictFilePath.compressedNames
  ) {
    const arrayBuffer = await res.arrayBuffer();
    const rawDict = await decompressWithPako(arrayBuffer);
    return TranslationService.parseDictionaryFile(rawDict);
  }
  const rawDict = await res.text();
  return TranslationService.parseDictionaryFile(rawDict);
};

/**
 * Removes all <br> and <br/> tags from a string
 *
 * @param text - The input string containing <br> tags
 * @returns The string with all <br> tags removed
 */
export function removeBrTags(text: string): string {
  if (!text) return text;
  return text.replace(/<br\s*\/?>/gi, "");
}

// Helper function to decompress with pako
export const decompressWithPako = async (arrayBuffer: ArrayBuffer) => {
  const compressedData = new Uint8Array(arrayBuffer);
  const decompressedData = pako.ungzip(compressedData, { to: "string" });
  return decompressedData;
};
