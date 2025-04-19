import { TranslationService } from "@/services/translate-service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_AVATAR_URL = "/default-avatar.jpg";

export enum DictFilePath {
  names = "/dicts/Names.txt",
  names2 = "/dicts/Names2.txt",
  vietphrase = "/dicts/VietPhrase.txt",
  hanViet = "/dicts/ChinesePhienAmWords.txt",
  luatNhan = "/dicts/LuatNhan.txt",
  vietphraseQuickTranslator = '/dicts/VietPhraseQuickTranslator.txt',
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
  return text.replace(/<br\s*\/?>/gi, '');
}