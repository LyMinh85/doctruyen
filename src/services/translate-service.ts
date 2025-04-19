/**
 * TranslatorEngine namespace for handling translations
 */
// Types to improve type safety
export interface DictionariesInput {
  hanViet?: Record<string, string>;
  vietPhrase?: Record<string, string>;
  thieuChuu?: Record<string, string>;
  lacViet?: Record<string, string>;
  cedict?: Record<string, string>;
  chinesePhienAmEnglish?: Record<string, string>;
  vietPhraseOneMeaning?: Record<string, string>;
  onlyVietPhrase?: Record<string, string>;
  onlyName?: Record<string, string>;
  onlyNameOneMeaning?: Record<string, string>;
  onlyNameChinh?: Record<string, string>;
  onlyNamePhu?: Record<string, string>;
  luatNhan?: Record<string, string>;
  pronoun?: Record<string, string>;
  pronounOneMeaning?: Record<string, string>;
  nhanBy?: Record<string, string> | null;
  nhanByOneMeaning?: Record<string, string> | null;
}
export type DataSetType = Record<string, unknown>; // Better typing than 'any'
/**
 * Represents a range of characters with a starting position and length
 */
export interface CharRange {
  startIndex: number;
  length: number;
}

/**
 * Main translator engine class with static methods and properties
 */
export class TranslationService {
  public static readonly CHINESE_LOOKUP_MAX_LENGTH = 20;
  public static readonly NULL_STRING = String.fromCharCode(0);

  private static _dictionaryDirty = true;
  private static readonly trimCharsForAnalyzer = [" ", "\n", "\t"];

  // Translation dictionaries
  public static readonly dictionaries = {
    hanViet: {} as Record<string, string>,
    vietPhrase: {} as Record<string, string>,
    thieuChuu: {} as Record<string, string>,
    lacViet: {} as Record<string, string>,
    cedict: {} as Record<string, string>,
    chinesePhienAmEnglish: {} as Record<string, string>,
    vietPhraseOneMeaning: {} as Record<string, string>,
    onlyVietPhrase: {} as Record<string, string>,
    onlyName: {} as Record<string, string>,
    onlyNameOneMeaning: {} as Record<string, string>,
    onlyNameChinh: {} as Record<string, string>,
    onlyNamePhu: {} as Record<string, string>,
    luatNhan: {} as Record<string, string>,
    pronoun: {} as Record<string, string>,
    pronounOneMeaning: {} as Record<string, string>,
    nhanBy: null as Record<string, string> | null,
    nhanByOneMeaning: null as Record<string, string> | null,
  };

  // History datastores
  private static readonly history = {
    onlyVietPhrase: {} as Record<string, unknown>,
    onlyName: {} as Record<string, unknown>,
    onlyNamePhu: {} as Record<string, unknown>,
    hanViet: {} as Record<string, unknown>,
  };

  // Ignored phrases lists
  private static readonly ignoredPhrases = {
    chinesePhrase: new Set<string>(),
    chinesePhraseForBrowser: new Set<string>(),
  };

  // Last translated words
  public static lastTranslated = {
    hanViet: "",
    vietPhrase: "",
    vietPhraseOneMeaning: "",
  };

  /**
   * Gets or sets whether the dictionary is dirty
   */
  public static get dictionaryDirty(): boolean {
    return TranslationService._dictionaryDirty;
  }

  public static set dictionaryDirty(value: boolean) {
    TranslationService._dictionaryDirty = value;
  }

  /**
   * Checks if a character is Chinese
   * @param character The character to check
   * @returns True if the character is Chinese, false otherwise
   */
  private static isChinese(character: string): boolean {
    // Check for Chinese characters in the Unicode range, excluding numbers
    if (/[0-9]/.test(character)) {
      return false;
    }
    return /[\u4e00-\u9fff]/.test(character);
  }

  /**
   * Checks if the next character in a string is Chinese
   * @param text The text to check
   * @param index The current index
   * @returns True if the next character is Chinese, false otherwise
   */
  private static nextCharIsChinese(text: string, index: number): boolean {
    if (index + 1 >= text.length) {
      return false;
    }
    return this.isChinese(text[index + 1]);
  }

  private static nextCharIsNewline(text: string, index: number): boolean {
    if (index + 1 >= text.length) {
      return false;
    }
    return text[index + 1] === "\n";
  }

  /**
   * Checks if all characters in the text are Chinese or numbers
   * @param text The text to check
   * @returns True if all characters are Chinese or numbers, false otherwise
   */
  private static isAllChinese(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
      if (!this.isChinese(text[i]) && !/[0-9]/.test(text[i])) {
        return false;
      }
    }
    return text.length > 0;
  }

  /**
   * Checks if the phrase contains a name
   * @param text The text to check
   * @param startIndex Start index of the phrase
   * @param length Length of the phrase
   * @returns True if the phrase contains a name, false otherwise
   */
  private static containsName(
    text: string,
    startIndex: number,
    length: number
  ): boolean {
    const phrase = text.substring(startIndex, startIndex + length);
    return this.dictionaries.onlyName[phrase] !== undefined;
  }

  /**
   * Checks if the phrase is the longest phrase in the sentence
   * @param text The text to check
   * @param startIndex Start index of the phrase
   * @param phraseLength Length of the phrase
   * @param dictionary Dictionary to check against
   * @param translationAlgorithm Algorithm to use for translation
   * @returns True if the phrase is the longest in the sentence, false otherwise
   */
  private static isLongestPhraseInSentence(
    text: string,
    startIndex: number,
    phraseLength: number,
    dictionary: Record<string, string>,
    translationAlgorithm: number
  ): boolean {
    if (phraseLength < 2) {
      return true;
    }

    const minLength =
      translationAlgorithm === 0
        ? phraseLength
        : phraseLength < 3
        ? 3
        : phraseLength;

    const endIndex = startIndex + phraseLength - 1;

    for (let i = startIndex + 1; i <= endIndex; i++) {
      for (let j = this.CHINESE_LOOKUP_MAX_LENGTH; j > minLength; j--) {
        if (
          text.length >= i + j &&
          dictionary[text.substring(i, i + j)] !== undefined
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Checks if a phrase matches any rules in a rule-based dictionary
   * @param text The text to check
   * @param dictionary The rule-based dictionary
   * @param result Output parameter for the resulting rule
   * @param matchLength Output parameter for the matched length
   * @returns The index of the match
   */
  private static containsLuatNhan(
    chinese: string,
    dictionary: Record<string, string> | null,
    result: { value: string },
    matchedLength: { value: number }
  ): number {
    const length = chinese.length;

    // We need to check all the rules in the luatNhan dictionary
    for (const rule in this.dictionaries.luatNhan) {
      if (length >= rule.length - 2) {
        // Replace {0} with regex pattern to match variable text
        const pattern = rule.replace("{0}", "([^,\\. ?]{1,10})");

        // Create a regular expression to match the pattern
        const regex = new RegExp(pattern, "g");
        let match: RegExpExecArray | null;
        let matchCount = 0;

        // Find all matches in the text
        while ((match = regex.exec(chinese)) !== null && matchCount < 2) {
          const capturedValue = match[1];

          if (rule.startsWith("{0}")) {
            // Rule starts with variable part
            for (let i = 0; i < capturedValue.length; i++) {
              if (dictionary?.[capturedValue.substring(i)] !== undefined) {
                result.value = pattern;
                matchedLength.value = match[0].length - i;
                return match.index + i;
              }
            }
          } else if (rule.endsWith("{0}")) {
            // Rule ends with variable part
            let varLength = capturedValue.length;
            while (0 < varLength) {
              if (
                dictionary?.[capturedValue.substring(0, varLength)] !==
                undefined
              ) {
                result.value = pattern;
                matchedLength.value =
                  match[0].length - (capturedValue.length - varLength);
                return match.index;
              }
              varLength--;
            }
          } else if (
            dictionary?.[capturedValue] !== undefined ||
            capturedValue.match(/^[0-9]+$/) !== null // number is accepted
          ) {
            // Rule has variable part in the middle
            result.value = pattern;
            matchedLength.value = match[0].length;
            return match.index;
          }

          matchCount++;
        }
      }
    }

    result.value = "";
    matchedLength.value = -1;
    return -1;
  }

  /**
   * Applies the rule-based transformation to the text
   * @param text The text to transform
   * @param dictionary The rule-based dictionary
   * @returns The transformed text
   */
  private static chineseToLuatNhan(
    chinese: string,
    dictionary: Record<string, string> | null
  ): string {
    const luatNhan = { value: "" };
    return this.chineseToLuatNhanWithRule(chinese, dictionary, luatNhan);
  }

  /**
   * Applies the rule-based transformation to the text with rule output
   * @param text The text to transform
   * @param dictionary The rule-based dictionary
   * @param luatNhan Output parameter for the applied rule
   * @returns The transformed text
   */
  private static chineseToLuatNhanWithRule(
    chinese: string,
    dictionary: Record<string, string> | null,
    luatNhan: { value: string }
  ): string {
    if (!dictionary) {
      console.error("LuatNhan dictionary not loaded");
      return chinese; // Return original text as fallback
    }

    // Check all rules in the luatNhan dictionary
    for (const rule in this.dictionaries.luatNhan) {
      // Replace {0} with regex pattern to capture the variable part
      const pattern = rule.replace("{0}", "(.+)");

      // Create a regular expression to match the exact pattern
      const regex = new RegExp("^" + pattern + "$");
      const match = regex.exec(chinese);

      if (
        match &&
        (dictionary?.[match[1]] !== undefined ||
          match[1].match(/^[0-9]+$/) !== null)
      ) {
        let translations: string[] = [];
        if (dictionary?.[match[1]] !== undefined) {
          // Get all possible translations for the variable part
          translations = dictionary[match[1]].split(/[\/|]/);
        } else {
          translations = [match[1]];
        }

        // Create a StringBuilder-like object for efficient string concatenation
        const result = {
          text: "",
          append: function (str: string) {
            this.text += str;
          },
          toString: function () {
            return this.text;
          },
        };

        // Replace {0} in the rule's value with each translation
        for (const translation of translations) {
          result.append(
            this.dictionaries.luatNhan[rule].replace("{0}", translation)
          );
          result.append("/");
        }

        luatNhan.value = rule;
        return result.toString().replace(/\/+$/, ""); // Trim trailing slashes
      }
    }

    // If no rule matches, throw an error (or handle as needed)
    console.error("Error processing rule for phrase: " + chinese);
    return chinese; // Return original text as fallback
  }

  /**
   * Loads the NhanBy dictionary with one meaning per entry
   */
  private static loadNhanByOneMeaningDictionary(): void {
    // Dictionary should already be loaded via loadAllDictionaries
  }

  /**
   * Converts Chinese text to Viet Phrase with one meaning per phrase
   * @param chinese The Chinese text to convert
   * @param wrapType Type of wrapping (0 = none, 1 = brackets)
   * @param translationAlgorithm Algorithm to use for translation
   * @param prioritizedName Whether to prioritize names
   * @returns Object containing the translated text and mapping arrays
   */
  public static chineseToVietPhraseOneMeaning(
    chinese: string,
    wrapType: number = 0,
    translationAlgorithm: number = 1,
    prioritizedName: boolean = true
  ): {
    text: string;
    chinesePhraseRanges: CharRange[];
    vietPhraseRanges: CharRange[];
  } {
    this.lastTranslated.vietPhraseOneMeaning = "";
    const chinesePhraseRanges: CharRange[] = [];
    const vietPhraseRanges: CharRange[] = [];
    chinese = this.cleanText(chinese);

    // Using a StringBuilder-like object for efficient string concatenation
    const result = {
      text: "",
      toString: function () {
        return this.text;
      },
      append: function (str: string) {
        this.text += str;
      },
      remove: function (index: number, length: number) {
        this.text =
          this.text.substring(0, index) + this.text.substring(index + length);
      },
    };

    const lastChar = chinese.length - 1;
    let i = 0;
    let lastCheckEndIndex = -1;
    let ruleStartIndex = -1;
    let ruleLength = -1;

    // Ensure nhanByOneMeaning dictionary is loaded
    if (this.dictionaries.nhanByOneMeaning === null) {
      this.loadNhanByOneMeaningDictionary();
    }

    const lastTranslatedWordRef = {
      value: this.lastTranslated.vietPhraseOneMeaning,
    };

    while (i <= lastChar) {
      let matched = false;
      let canCheckRules = true;

      // Try to match phrases from longest to shortest
      for (let j = this.CHINESE_LOOKUP_MAX_LENGTH; j > 0; j--) {
        if (chinese.length >= i + j) {
          const phrase = chinese.substring(i, i + j);
          if (phrase === "主宰") {
            console.log(`Phrase: ${phrase}, i: ${i}, j: ${j}`);
          }

          // Skip if the phrase is empty or contains only whitespace
          if (phrase === "\n") {
            result.append("\n");
            matched = true;
            i += j;
            break;
          }

          if (
            prioritizedName &&
            this.dictionaries.onlyName[phrase] !== undefined
          ) {
            if (wrapType === 0) {
              let translated = this.dictionaries.onlyName[phrase];
              if (translated.includes("/")) {
                translated = translated.split("/")[0];
              }

              this.appendTranslatedWordWithIndex(
                result,
                translated,
                lastTranslatedWordRef,
                result.text.length
              );
              vietPhraseRanges.push({
                startIndex: result.text.length - translated.length,
                length: translated.length,
              });
            } else {
              let translated = "[" + this.dictionaries.onlyName[phrase] + "]";
              if (translated.includes("/")) {
                translated = translated.split("/")[0];
              }

              this.appendTranslatedWordWithIndex(
                result,
                translated,
                lastTranslatedWordRef,
                result.text.length
              );
              vietPhraseRanges.push({
                startIndex: result.text.length - translated.length,
                length: translated.length,
              });
            }

            if (this.nextCharIsChinese(chinese, i + j - 1)) {
              result.append(" ");
              lastTranslatedWordRef.value += " ";
            }

            if (this.nextCharIsNewline(chinese, i + j - 1)) {
              result.append("\n");
              lastTranslatedWordRef.value += "\n";
            }

            matched = true;
            i += j;
            break;
          } else if (
            // Try to match in vietPhraseOneMeaning dictionary

            this.dictionaries.vietPhraseOneMeaning[phrase] !== undefined
          ) {
            if (
              (!prioritizedName || !this.containsName(chinese, i, j)) &&
              ((translationAlgorithm !== 0 && translationAlgorithm !== 2) ||
                this.isLongestPhraseInSentence(
                  chinese,
                  i,
                  j,
                  this.dictionaries.vietPhraseOneMeaning,
                  translationAlgorithm
                ) ||
                (prioritizedName &&
                  this.dictionaries.onlyName[phrase] !== undefined))
            ) {
              chinesePhraseRanges.push({ startIndex: i, length: j });

              if (wrapType === 0) {
                let translated = this.dictionaries.vietPhraseOneMeaning[phrase];
                if (translated.includes("/")) {
                  translated = translated.split("/")[0];
                }

                this.appendTranslatedWordWithIndex(
                  result,
                  translated,
                  lastTranslatedWordRef,
                  result.text.length
                );
                vietPhraseRanges.push({
                  startIndex: result.text.length - translated.length,
                  length: translated.length,
                });
              } else {
                let translated =
                  "[" + this.dictionaries.vietPhraseOneMeaning[phrase] + "]";
                if (translated.includes("/")) {
                  translated = translated.split("/")[0];
                }

                this.appendTranslatedWordWithIndex(
                  result,
                  translated,
                  lastTranslatedWordRef,
                  result.text.length
                );
                vietPhraseRanges.push({
                  startIndex: result.text.length - translated.length,
                  length: translated.length,
                });
              }

              if (this.nextCharIsChinese(chinese, i + j - 1)) {
                result.append(" ");
                lastTranslatedWordRef.value += " ";
              }

              if (this.nextCharIsNewline(chinese, i + j - 1)) {
                result.append("\n");
                lastTranslatedWordRef.value += "\n";
              }

              matched = true;
              i += j;
              break;
            }
          }
          // Check for rule-based translations
          else if (
            !phrase.includes("\n") &&
            !phrase.includes("\t") &&
            this.dictionaries.nhanByOneMeaning !== null &&
            canCheckRules &&
            2 < j &&
            lastCheckEndIndex < i + j - 1 &&
            this.isAllChinese(phrase)
          ) {
            if (i < ruleStartIndex) {
              if (ruleStartIndex < i + j && j <= ruleLength - ruleStartIndex) {
                j = ruleStartIndex - i + 1;
              }
            } else {
              const resultRef = { value: "" };
              const matchLengthRef = { value: 0 };
              const matchIndex = this.containsLuatNhan(
                phrase,
                this.dictionaries.nhanByOneMeaning,
                resultRef,
                matchLengthRef
              );

              ruleStartIndex = i + matchIndex;
              ruleLength = ruleStartIndex + matchLengthRef.value;

              if (matchIndex === 0) {
                if (
                  this.isLongestPhraseInSentence(
                    chinese,
                    i - 1,
                    matchLengthRef.value - 1,
                    this.dictionaries.vietPhraseOneMeaning,
                    translationAlgorithm
                  )
                ) {
                  j = matchLengthRef.value;
                  chinesePhraseRanges.push({ startIndex: i, length: j });

                  const translated = this.chineseToLuatNhan(
                    phrase,
                    this.dictionaries.nhanByOneMeaning
                  );

                  if (wrapType === 0) {
                    this.appendTranslatedWordWithIndex(
                      result,
                      translated,
                      lastTranslatedWordRef,
                      result.text.length
                    );
                    vietPhraseRanges.push({
                      startIndex: result.text.length - translated.length,
                      length: translated.length,
                    });
                  } else {
                    const wrappedTranslated = "[" + translated + "]";
                    this.appendTranslatedWordWithIndex(
                      result,
                      wrappedTranslated,
                      lastTranslatedWordRef,
                      result.text.length
                    );
                    vietPhraseRanges.push({
                      startIndex: result.text.length - wrappedTranslated.length,
                      length: wrappedTranslated.length,
                    });
                  }

                  if (this.nextCharIsChinese(chinese, i + j - 1)) {
                    result.append(" ");
                    lastTranslatedWordRef.value += " ";
                  }

                  matched = true;
                  i += j;
                  break;
                }
              } else if (matchIndex <= 0) {
                lastCheckEndIndex = i + j - 1;
                canCheckRules = false;

                let extendedLength = 100;
                while (
                  i + extendedLength < chinese.length &&
                  this.isChinese(chinese[i + extendedLength - 1])
                ) {
                  extendedLength++;
                }

                if (i + extendedLength <= chinese.length) {
                  const extendedPhrase = chinese.substring(
                    i,
                    i + extendedLength
                  );
                  const extendedMatchIndex = this.containsLuatNhan(
                    extendedPhrase,
                    this.dictionaries.nhanByOneMeaning,
                    resultRef,
                    matchLengthRef
                  );

                  if (extendedMatchIndex < 0) {
                    lastCheckEndIndex = i + extendedLength - 1;
                  }
                }
              }
            }
          }
        }
      }

      // If no match found, translate character by character
      if (!matched) {
        const resultLength = result.text.length;
        const hanVietLength = this.chineseToHanViet(chinese[i]).length;

        chinesePhraseRanges.push({ startIndex: i, length: 1 });

        if (this.isChinese(chinese[i])) {
          const hanViet = this.chineseToHanViet(chinese[i]);
          const translatedText = wrapType !== 1 ? hanViet : `[${hanViet}]`;

          this.appendTranslatedWordWithIndex(
            result,
            translatedText,
            lastTranslatedWordRef,
            result.text.length
          );

          if (this.nextCharIsChinese(chinese, i)) {
            result.append(" ");
            lastTranslatedWordRef.value += " ";
          }

          const effectiveLength = hanVietLength + (wrapType !== 1 ? 0 : 2);
          vietPhraseRanges.push({
            startIndex: resultLength,
            length: effectiveLength,
          });
        } else if (
          (chinese[i] === '"' || chinese[i] === "'") &&
          !lastTranslatedWordRef.value.endsWith(" ") &&
          !lastTranslatedWordRef.value.endsWith(".") &&
          !lastTranslatedWordRef.value.endsWith("?") &&
          !lastTranslatedWordRef.value.endsWith("!") &&
          !lastTranslatedWordRef.value.endsWith("\t") &&
          i < chinese.length - 1 &&
          chinese[i + 1] !== " " &&
          chinese[i + 1] !== ","
        ) {
          result.append(" " + chinese[i]);
          lastTranslatedWordRef.value =
            lastTranslatedWordRef.value + " " + chinese[i];
          vietPhraseRanges.push({ startIndex: resultLength, length: 2 });
        } else {
          result.append(chinese[i]);
          lastTranslatedWordRef.value += chinese[i];
          vietPhraseRanges.push({ startIndex: resultLength, length: 1 });
        }

        i++;
      }
    }

    this.lastTranslated.vietPhraseOneMeaning = "";
    result.text = this.formatResult(result.text);
    return {
      text: result.text,
      chinesePhraseRanges,
      vietPhraseRanges,
    };
  }

  /**
   * Converts a string to uppercase
   * @param text Text to convert
   * @returns Uppercase text
   */
  private static toUpperCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Converts full-width characters to their half-width equivalents
   * @param str String containing full-width characters
   * @returns String with full-width characters converted to half-width
   */
  private static toNarrow(str: string): string {
    const length = str.length;

    // First, check if there are any full-width characters
    // This avoids unnecessary string building if no conversion is needed
    let i: number;
    for (i = 0; i < length; i++) {
      const c = str.charAt(i);
      // Check if character is in the full-width range (！ to ～)
      if (c >= "！" && c <= "～") {
        break;
      }
    }

    // If no full-width characters were found, return the original string
    if (i >= length) {
      return str;
    }

    // Initialize result string to build the narrow version
    let result = "";

    // Convert each character as needed
    for (i = 0; i < length; i++) {
      const c = str.charAt(i);
      if (c >= "！" && c <= "～") {
        // Convert full-width to half-width by calculating the offset
        // between full-width and half-width character codes
        const halfWidthChar = String.fromCharCode(
          c.charCodeAt(0) - "！".charCodeAt(0) + "!".charCodeAt(0)
        );
        result += halfWidthChar;
      } else {
        // Keep non-full-width characters as is
        result += c;
      }
    }

    return result;
  }

  /**
   * Appends a translated word to the result with proper formatting
   * @param result StringBuilder to append to
   * @param translatedText Text to append
   * @param lastTranslatedWord Reference to the last translated word
   */
  private static appendTranslatedWord(
    result: {
      toString: () => string;
      append: (text: string) => void;
      remove: (index: number, length: number) => void;
    },
    translatedText: string,
    lastTranslatedWord: { value: string }
  ): void {
    const startIndexOfNextTranslatedText = 0;
    this.appendTranslatedWordWithIndex(
      result,
      translatedText,
      lastTranslatedWord,
      startIndexOfNextTranslatedText
    );
  }

  /**
   * Appends a translated word to the result with proper formatting and tracking of index
   * @param result StringBuilder to append to
   * @param translatedText Text to append
   * @param lastTranslatedWord Reference to the last translated word
   * @param startIndexOfNextTranslatedText Reference to the start index for the next translated text
   */
  private static appendTranslatedWordWithIndex(
    result: {
      toString: () => string;
      append: (text: string) => void;
      remove: (index: number, length: number) => void;
    },
    translatedText: string,
    lastTranslatedWord: { value: string },
    startIndexOfNextTranslatedText: number
  ): void {
    if (
      lastTranslatedWord.value.endsWith("\n") ||
      lastTranslatedWord.value.endsWith("\t") ||
      lastTranslatedWord.value.endsWith(". ") ||
      lastTranslatedWord.value.endsWith('"') ||
      lastTranslatedWord.value.endsWith("'") ||
      lastTranslatedWord.value.endsWith("? ") ||
      lastTranslatedWord.value.endsWith("! ") ||
      lastTranslatedWord.value.endsWith('." ') ||
      lastTranslatedWord.value.endsWith('?" ') ||
      lastTranslatedWord.value.endsWith('!" ') ||
      lastTranslatedWord.value.endsWith(": ")
    ) {
      lastTranslatedWord.value = this.toUpperCase(translatedText);
    } else if (
      lastTranslatedWord.value.endsWith(" ") ||
      lastTranslatedWord.value.endsWith("(")
    ) {
      lastTranslatedWord.value = translatedText;
    } else {
      lastTranslatedWord.value = " " + translatedText;
    }

    // Remove space if next character is punctuation
    const resultText = result.toString();
    if (
      (translatedText.length === 0 ||
        [",", ".", "?", "!"].includes(translatedText[0])) &&
      resultText.length > 0 &&
      resultText[resultText.length - 1] === " "
    ) {
      result.remove(resultText.length - 1, 1);
      startIndexOfNextTranslatedText--;
    }

    result.append(lastTranslatedWord.value);
  }

  /**
   * Converts a Chinese character to Han Viet
   * @param chinese Chinese character to convert
   * @returns Han Viet representation of the character
   */
  public static chineseToHanViet(chinese: string): string {
    if (chinese === " ") {
      return "";
    }

    if (!(chinese in this.dictionaries.hanViet)) {
      return this.toNarrow(chinese);
    }

    return this.dictionaries.hanViet[chinese] || "";
  }

  /**
   * Converts a Chinese string to Han Viet with character mapping
   * @param chinese Chinese string to convert
   * @returns Object containing the converted text and mapping array
   */
  public static chineseToHanVietWithMapping(chinese: string): {
    text: string;
    mapping: CharRange[];
  } {
    this.lastTranslated.hanViet = "";
    const mappingArray: CharRange[] = [];

    // Using a custom StringBuilder-like object to match the C# implementation
    const result = {
      text: "",
      toString: function () {
        return this.text;
      },
      append: function (str: string) {
        this.text += str;
      },
      remove: function (index: number, length: number) {
        this.text =
          this.text.substring(0, index) + this.text.substring(index + length);
      },
    };

    const lastTranslatedWordRef = { value: this.lastTranslated.hanViet };
    const length = chinese.length;

    // Process all characters except the last one
    for (let i = 0; i < length - 1; i++) {
      const currentLength = result.text.length;
      const currentChar = chinese[i];
      const nextChar = chinese[i + 1];

      if (this.isChinese(currentChar)) {
        const startIndexRef = currentLength;

        if (this.isChinese(nextChar)) {
          // Current and next are both Chinese
          const translated = this.chineseToHanViet(currentChar);
          this.appendTranslatedWordWithIndex(
            result,
            translated,
            lastTranslatedWordRef,
            startIndexRef
          );
          result.append(" ");
          lastTranslatedWordRef.value += " ";
          mappingArray.push({
            startIndex: startIndexRef,
            length: translated.length,
          });
        } else {
          // Current is Chinese but next is not
          const translated = this.chineseToHanViet(currentChar);
          this.appendTranslatedWordWithIndex(
            result,
            translated,
            lastTranslatedWordRef,
            startIndexRef
          );
          mappingArray.push({
            startIndex: startIndexRef,
            length: translated.length,
          });
        }
      } else {
        // Current is not Chinese
        result.append(currentChar);
        lastTranslatedWordRef.value += currentChar;
        mappingArray.push({ startIndex: currentLength, length: 1 });
      }
    }

    // Process the last character
    if (length > 0) {
      const lastChar = chinese[length - 1];

      if (this.isChinese(lastChar)) {
        const translated = this.chineseToHanViet(lastChar);
        this.appendTranslatedWord(result, translated, lastTranslatedWordRef);
        mappingArray.push({
          startIndex: result.text.length,
          length: translated.length,
        });
      } else {
        result.append(lastChar);
        lastTranslatedWordRef.value += lastChar;
        mappingArray.push({ startIndex: result.text.length, length: 1 });
      }
    }

    this.lastTranslated.hanViet = "";
    return { text: result.text, mapping: mappingArray };
  }

  /**
   * Loads the Han Viet dictionary asynchronously
   * @returns Promise that resolves when dictionary is loaded
   */
  public static async loadHanVietDictionary(): Promise<void> {
    try {
      // Clear existing dictionary
      this.dictionaries.hanViet = {};

      // In Next.js, we have several options for loading dictionary data:

      // Option 1: Using API routes (most common approach)
      const response = await fetch("/api/dictionaries/hanviet");
      if (!response.ok) {
        throw new Error(
          `Failed to load Han Viet dictionary: ${response.statusText}`
        );
      }

      const data = await response.text();

      const parsedData = TranslationService.parseDictionaryContent(data);

      // Populate the dictionary with parsed data
      for (const key in parsedData) {
        if (!(key in this.dictionaries.hanViet)) {
          this.dictionaries.hanViet[key] = parsedData[key];
        }
      }
    } catch (error) {
      console.error("Error loading Han Viet dictionary:", error);
      // Re-throw or handle as needed for your application
      throw error;
    }
  }

  /**
   * Helper method to parse dictionary file content
   * @param content Raw text content of dictionary file
   * @returns Map containing key-value pairs from the dictionary
   */
  public static parseDictionaryContent(
    content: string
  ): Record<string, string> {
    const dictionary = {} as Record<string, string>;
    const lines = content.split("\n");

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      const parts = line.split("=");
      if (parts.length === 2 && !(parts[0] in dictionary)) {
        dictionary[parts[0]] = parts[1];
      }
    }

    return dictionary;
  }

  /**
   * Loads all dictionaries asynchronously
   * @returns Promise that resolves when all dictionaries are loaded
   */
  public static async loadAllDictionaries({
    hanViet,
    vietPhrase,
    thieuChuu,
    lacViet,
    cedict,
    chinesePhienAmEnglish,
    vietPhraseOneMeaning,
    onlyVietPhrase,
    onlyName,
    onlyNameOneMeaning,
    onlyNameChinh,
    onlyNamePhu,
    luatNhan,
    pronoun,
    pronounOneMeaning,
    nhanBy,
    nhanByOneMeaning,
  }: DictionariesInput): Promise<void> {
    try {
      this.dictionaries.hanViet = hanViet || {};
      this.dictionaries.vietPhrase = vietPhrase || {};
      this.dictionaries.thieuChuu = thieuChuu || {};
      this.dictionaries.lacViet = lacViet || {};
      this.dictionaries.cedict = cedict || {};
      this.dictionaries.chinesePhienAmEnglish = chinesePhienAmEnglish || {};
      // this.setVietPhraseOneMeaning(vietPhraseOneMeaning || {});
      this.dictionaries.vietPhraseOneMeaning = vietPhraseOneMeaning || {};
      this.dictionaries.onlyVietPhrase = onlyVietPhrase || {};
      this.dictionaries.onlyName = onlyName || {};
      this.dictionaries.onlyNameOneMeaning = onlyNameOneMeaning || {};
      this.dictionaries.onlyNameChinh = onlyNameChinh || {};
      this.dictionaries.onlyNamePhu = onlyNamePhu || {};
      this.dictionaries.luatNhan = luatNhan || {};
      this.dictionaries.pronoun = pronoun || {};
      this.dictionaries.pronounOneMeaning = pronounOneMeaning || {};
      this.dictionaries.nhanBy = nhanBy || null;
      this.dictionaries.nhanByOneMeaning = nhanByOneMeaning || null;

      // Mark dictionaries as clean after successful loading
      this._dictionaryDirty = false;
    } catch (error) {
      console.error("Error loading dictionaries:", error);
      throw error;
    }
  }

  public static setVietPhraseOneMeaning(
    vietPhraseOneMeaning: Record<string, string>
  ): void {
    // Set the dictionary and process each entry to keep only the first meaning
    this.dictionaries.vietPhraseOneMeaning = {};
    for (const [key, value] of Object.entries(vietPhraseOneMeaning)) {
      // Split by / and keep only the first part
      if (value.includes("/")) {
        const firstMeaning = value.split("/")[0].trim();
        this.dictionaries.vietPhraseOneMeaning[key] = firstMeaning;
      } else if (value.includes("|")) {
        const firstMeaning = value.split("|")[0].trim();
        this.dictionaries.vietPhraseOneMeaning[key] = firstMeaning;
      }
    }
  }

  /**
   * Clean text by normalizing punctuation and whitespace
   * @param text - Text to clean
   * @returns Cleaned text
   */
  public static cleanText(text: string): string {
    const punctuationMap: Record<string, string> = {
      "ă€‚": ".",
      "ï¼Œ": ",",
      "ă€": ",",
      "â€œ": '"',
      "â€": '"',
      "ï¼": ":",
    };

    for (const char in punctuationMap) {
      if (Object.hasOwnProperty.call(punctuationMap, char)) {
        text = text.replaceAll(char, punctuationMap[char]);
      }
    }

    return (
      text
        .trim()
        .replace(/\r/g, "")
        .replace(/&nbsp;/gim, " ")
        .replace(/&ensp;/gim, "  ")
        .replace(/&emsp;/gim, "    ")
        .replace(/(?<=\p{Script=Han})的(?=\p{Script=Han})/gu, "")
        // remove "了" if the sentence ends with "了"
        .replace(/了$/gim, "")
        .replaceAll("　　", "")
    );
  }

  /**
   * Helper method to format the result of a translation
   * Find all "\n" then wrap that sentence inside of <p> tag
   * Capitalizes the first letter of each sentence
   * @param text Text to format
   * @returns Formatted text
   */
  public static formatResult(text: string) {
    text = text
      .replaceAll("，", ",")
      .replaceAll("。", ".")
      .replaceAll("：", ":")
      .replaceAll("？", "?")
      .replaceAll("！", "!");
    const sentences = text.split("\n");
    const formattedSentences = sentences.map((sentence) => {
      let trimmedSentence = sentence.trim();
      // console.log(trimmedSentence);
      if (!trimmedSentence) return "";

      // Capitalize the first letter of the sentence
      if (trimmedSentence.length > 0) {
        // If the sentence begin with a quote, capitalize the first letter after the quote
        if (trimmedSentence.startsWith("“")) {
          const quoteIndex = trimmedSentence.indexOf("“", 0);
          if (quoteIndex !== -1) {
            trimmedSentence =
              trimmedSentence.slice(0, quoteIndex + 1) +
              trimmedSentence.charAt(quoteIndex + 1).toUpperCase() +
              trimmedSentence.slice(quoteIndex + 2);
          }
        } else if (trimmedSentence.startsWith("'")) {
          const quoteIndex = trimmedSentence.indexOf("'", 0);
          if (quoteIndex !== -1) {
            trimmedSentence =
              trimmedSentence.slice(0, quoteIndex + 1) +
              trimmedSentence.charAt(quoteIndex + 1).toUpperCase() +
              trimmedSentence.slice(quoteIndex + 2);
          }
        } else {
          trimmedSentence =
            trimmedSentence.charAt(0).toUpperCase() + trimmedSentence.slice(1);
        }
      }

      return `<p>${trimmedSentence}</p>`;
    });
    return formattedSentences.join("");
  }

  /**
   * Parse dictionary file content into key-value pairs
   * @param content - Raw text content of dictionary file
   * @returns Record containing key-value pairs from the dictionary
   */
  public static parseDictionaryFile(content: string): Record<string, string> {
    const dictionary: Record<string, string> = {};

    if (!content || content.trim().length === 0) {
      return dictionary;
    }

    // Split the content by new lines and process each line
    const lines = content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith("#") || line.trim().length === 0) {
        continue;
      }

      // Split each line by the first tab or equal sign
      const parts = line.split(/[=\t](.+)/);

      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();

        if (key.length > 0 && value.length > 0) {
          dictionary[key] = value;
        }
      }
    }

    return dictionary;
  }
}

const translationServiceInstance = new TranslationService();
export default translationServiceInstance;
