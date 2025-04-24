import { TranslationService } from "@/services/translate-service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import pako from "pako";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_AVATAR_URL = "/default-avatar.jpg";
export const UNCOMPRESSED_DICT_PATH = "/data/dictionaries";
export const COMPRESSED_DICT_PATH = "/dicts";

export enum DictionaryFilePath {
  names = `/Names.txt`,
  names2 = `/Names2.txt`,
  hanViet = `/ChinesePhienAmWords.txt`,
  luatNhan = `/LuatNhan.txt`,
  vietphraseQuickTranslator = `/VietPhraseQuickTranslator.txt`,
}

export const dictionariesData = Object.entries(DictionaryFilePath)
  .filter(([key, filePath]) => !key.includes("/"))
  .map(([key, filePath]) => ({
    id: key,
    name: filePath.split("/").pop()?.split(".")[0] || "Unknown",
    filePath: `${UNCOMPRESSED_DICT_PATH}${filePath}`,
  }));

/**
 * Returns the key corresponding to a given dictionary file path.
 *
 * @param dictFilePath - The dictionary file path to look up
 * @returns The key associated with the dictionary file path
 * @throws Error if the dictionary file path is not found
 */
export const getKeyFromDictionaryFilePath = (
  dictFilePath: DictionaryFilePath
): string => {
  const keys = Object.keys(DictionaryFilePath);
  const values = Object.values(DictionaryFilePath);
  const index = values.indexOf(dictFilePath);
  if (index === -1) {
    throw new Error(`Dictionary file path not found: ${dictFilePath}`);
  }
  return keys[index];
};

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
  dictFilePath: DictionaryFilePath
): Promise<Record<string, string>> => {
  const res = await fetch(
    `${COMPRESSED_DICT_PATH}/${getKeyFromDictionaryFilePath(
      dictFilePath
    )}.txt.gz`
  );
  const arrayBuffer = await res.arrayBuffer();
  const rawDict = await decompressWithPako(arrayBuffer);
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
