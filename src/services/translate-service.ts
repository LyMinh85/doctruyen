/**
 * Result object for translation operations
 */
interface TranslationResult {
  text: string;
  chinesePhraseRanges: CharRange[];
  vietPhraseRanges: CharRange[];
}

/**
 * Result buffer for efficient string construction
 */
interface ResultBuffer {
  text: string;
  toString(): string;
  append(str: string): void;
  remove(index: number, length: number): void;
}

/**
 * Wrap types for translation output
 */
enum WrapType {
  NONE = 0,
  BRACKETS = 1,
}

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
   * Converts Chinese text to Vietnamese phrases with one meaning per phrase
   * @param chinese The Chinese text to convert
   * @param wrapType Type of wrapping (0 = none, 1 = brackets)
   * @param translationAlgorithm Algorithm to use for translation
   * @param prioritizedName Whether to prioritize names
   * @param isFormatResult Whether to format the final result
   * @returns Object containing the translated text and mapping arrays
   */
  public static chineseToVietPhraseOneMeaning(
    chinese: string,
    wrapType: WrapType = WrapType.NONE,
    translationAlgorithm: number = 1,
    prioritizedName: boolean = true,
    isFormatResult: boolean = true
  ): TranslationResult {
    // Initialize tracking variables
    this.lastTranslated.vietPhraseOneMeaning = "";
    const chinesePhraseRanges: CharRange[] = [];
    const vietPhraseRanges: CharRange[] = [];
    chinese = this.cleanText(chinese);

    // Create result buffer for efficient string building
    const result = this.createResultBuffer();
    const lastTranslatedWordRef = {
      value: this.lastTranslated.vietPhraseOneMeaning,
    };

    // Load dictionary if needed
    this.ensureDictionariesLoaded();

    // Process the text
    const lastChar = chinese.length - 1;
    let i = 0;
    let lastCheckEndIndex = -1;
    let ruleStartIndex = -1;
    let ruleLength = -1;

    while (i <= lastChar) {
      // Try to translate the current position
      const translationResult = this.translateChineseAtPosition(
        chinese,
        i,
        wrapType,
        translationAlgorithm,
        prioritizedName,
        result,
        lastTranslatedWordRef,
        chinesePhraseRanges,
        vietPhraseRanges,
        lastCheckEndIndex,
        ruleStartIndex,
        ruleLength
      );

      // Update tracking variables
      if (translationResult.matched) {
        i += translationResult.advanceBy;
        lastCheckEndIndex = translationResult.lastCheckEndIndex;
        ruleStartIndex = translationResult.ruleStartIndex;
        ruleLength = translationResult.ruleLength;
      } else {
        // Handle single character translation as fallback
        this.translateSingleCharacter(
          chinese,
          i,
          wrapType,
          result,
          lastTranslatedWordRef,
          chinesePhraseRanges,
          vietPhraseRanges
        );
        i++;
      }
    }

    // Format result if requested
    this.lastTranslated.vietPhraseOneMeaning = "";
    let finalText = result.text;

    if (isFormatResult) {
      finalText = this.formatResult(finalText);
      // Apply additional formatting fixes
      finalText = this.applyFormatFixes(finalText);
    }

    return {
      text: finalText,
      chinesePhraseRanges,
      vietPhraseRanges,
    };
  }

  /**
   * Applies additional formatting fixes to the translated text
   * @param text The text to fix
   * @returns The fixed text
   */
  private static applyFormatFixes(text: string): string {
    // Fix double colons
    let result = text.replace(/(\d+):{2}/g, "$1:");

    // Fix email addresses - remove spaces after @ symbol
    result = result.replace(/@\s+/g, "@");

    // Fix website URLs - remove spaces between domain parts
    result = result.replace(
      /www\.\s*([a-zA-Z0-9_-]+)\s*\.\s*([a-zA-Z0-9_-]+)/g,
      "www.$1.$2"
    );

    // Fix spaces around punctuation
    result = result.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
    result = result.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]");

    // Fix spaces around punctuation in Vietnamese
    result = result.replace(/\s+([,.!?:;])/g, "$1");

    // Keep proper spacing for URLs and emails
    result = result.replace(/(https?:\/\/\S+)\s/g, "$1 ");
    result = result.replace(/(\S+@\S+\.\S+)\s/g, "$1 ");

    // Preserve table formatting
    result = this.preserveTableFormatting(result);

    return result;
  }

  /**
   * Preserves table formatting in the translated text
   * @param text The text to process
   * @returns The text with preserved table formatting
   */
  private static preserveTableFormatting(text: string): string {
    // Identify table-like structures
    const tablePattern = /([^\n]+:[^\n]+\t[^\n]+:[^\n]+)/g;

    return text.replace(tablePattern, (match) => {
      // Ensure consistent spacing in table cells
      return match.replace(/:\s+/g, ": ").replace(/\t\s+/g, "\t");
    });
  }

  /**
   * Ensures all required dictionaries are loaded
   */
  private static ensureDictionariesLoaded(): void {
    if (this.dictionaries.nhanByOneMeaning === null) {
      this.loadNhanByOneMeaningDictionary();
    }
  }

  /**
   * Creates a result buffer for efficient string building
   */
  private static createResultBuffer(): ResultBuffer {
    return {
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
  }

  /**
   * Attempts to translate Chinese text at a specific position
   * @param chinese The Chinese text to translate
   * @param position Current position in the text
   * @param wrapType Type of wrapping
   * @param translationAlgorithm Algorithm to use
   * @param prioritizedName Whether to prioritize names
   * @param result Result buffer
   * @param lastTranslatedWordRef Reference to last translated word
   * @param chinesePhraseRanges Array of Chinese phrase ranges
   * @param vietPhraseRanges Array of Vietnamese phrase ranges
   * @param lastCheckEndIndex Last checked end index
   * @param ruleStartIndex Rule start index
   * @param ruleLength Rule length
   * @returns Translation result and position updates
   */
  private static translateChineseAtPosition(
    chinese: string,
    position: number,
    wrapType: WrapType,
    translationAlgorithm: number,
    prioritizedName: boolean,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string },
    chinesePhraseRanges: CharRange[],
    vietPhraseRanges: CharRange[],
    lastCheckEndIndex: number,
    ruleStartIndex: number,
    ruleLength: number
  ): {
    matched: boolean;
    advanceBy: number;
    lastCheckEndIndex: number;
    ruleStartIndex: number;
    ruleLength: number;
  } {
    // Try to match longest phrases first
    for (let length = this.CHINESE_LOOKUP_MAX_LENGTH; length > 0; length--) {
      if (chinese.length < position + length) continue;

      const phrase = chinese.substring(position, position + length);

      // Handle newlines directly
      if (phrase === "\n") {
        result.append("\n");
        return {
          matched: true,
          advanceBy: length,
          lastCheckEndIndex,
          ruleStartIndex,
          ruleLength,
        };
      }

      // Try to match in the name dictionary first if prioritizing names
      if (prioritizedName && this.dictionaries.onlyName[phrase] !== undefined) {
        this.appendTranslatedName(
          phrase,
          wrapType,
          result,
          lastTranslatedWordRef,
          vietPhraseRanges
        );

        this.appendSpacingIfNeeded(
          chinese,
          position + length - 1,
          result,
          lastTranslatedWordRef
        );

        return {
          matched: true,
          advanceBy: length,
          lastCheckEndIndex,
          ruleStartIndex,
          ruleLength,
        };
      }

      // Try to match in the Vietnamese phrase dictionary
      if (this.dictionaries.vietPhraseOneMeaning[phrase] !== undefined) {
        const shouldTranslate = this.shouldTranslateAsPhrase(
          chinese,
          position,
          length,
          translationAlgorithm,
          prioritizedName
        );

        if (shouldTranslate) {
          chinesePhraseRanges.push({ startIndex: position, length });

          this.appendTranslatedPhrase(
            phrase,
            wrapType,
            result,
            lastTranslatedWordRef,
            vietPhraseRanges
          );

          this.appendSpacingIfNeeded(
            chinese,
            position + length - 1,
            result,
            lastTranslatedWordRef
          );

          return {
            matched: true,
            advanceBy: length,
            lastCheckEndIndex,
            ruleStartIndex,
            ruleLength,
          };
        }
      }

      // Try rule-based translation if other methods failed
      const ruleResult = this.tryRuleBasedTranslation(
        chinese,
        position,
        length,
        phrase,
        wrapType,
        translationAlgorithm,
        result,
        lastTranslatedWordRef,
        chinesePhraseRanges,
        vietPhraseRanges,
        lastCheckEndIndex,
        ruleStartIndex,
        ruleLength
      );

      if (ruleResult.matched) {
        return ruleResult;
      } else {
        lastCheckEndIndex = ruleResult.lastCheckEndIndex;
        ruleStartIndex = ruleResult.ruleStartIndex;
        ruleLength = ruleResult.ruleLength;
      }
    }

    // No match found
    return {
      matched: false,
      advanceBy: 0,
      lastCheckEndIndex,
      ruleStartIndex,
      ruleLength,
    };
  }

  /**
   * Attempts to translate using rule-based methods
   */
  private static tryRuleBasedTranslation(
    chinese: string,
    position: number,
    length: number,
    phrase: string,
    wrapType: WrapType,
    translationAlgorithm: number,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string },
    chinesePhraseRanges: CharRange[],
    vietPhraseRanges: CharRange[],
    lastCheckEndIndex: number,
    ruleStartIndex: number,
    ruleLength: number
  ): {
    matched: boolean;
    advanceBy: number;
    lastCheckEndIndex: number;
    ruleStartIndex: number;
    ruleLength: number;
  } {
    // Check if we should attempt rule-based translation
    const canCheckRules =
      !phrase.includes("\n") &&
      !phrase.includes("\t") &&
      this.dictionaries.nhanByOneMeaning !== null &&
      2 < length &&
      lastCheckEndIndex < position + length - 1 &&
      this.isAllChinese(phrase);

    if (!canCheckRules) {
      return {
        matched: false,
        advanceBy: 0,
        lastCheckEndIndex,
        ruleStartIndex,
        ruleLength,
      };
    }

    // Handle rule positioning
    if (position < ruleStartIndex) {
      if (
        ruleStartIndex < position + length &&
        length <= ruleLength - ruleStartIndex
      ) {
        // Adjust length to avoid overlapping with existing rule
        return {
          matched: false,
          advanceBy: 0,
          lastCheckEndIndex,
          ruleStartIndex,
          ruleLength,
        };
      }
    } else {
      const resultRef = { value: "" };
      const matchLengthRef = { value: 0 };

      // Check if phrase contains a rule match
      const matchIndex = this.containsLuatNhan(
        phrase,
        this.dictionaries.nhanByOneMeaning,
        resultRef,
        matchLengthRef
      );

      // Update rule position tracking
      const newRuleStartIndex = position + matchIndex;
      const newRuleLength = newRuleStartIndex + matchLengthRef.value;

      if (matchIndex === 0) {
        // Direct match at current position
        if (
          this.isLongestPhraseInSentence(
            chinese,
            position - 1,
            matchLengthRef.value - 1,
            this.dictionaries.vietPhraseOneMeaning,
            translationAlgorithm
          )
        ) {
          const ruleLength = matchLengthRef.value;
          chinesePhraseRanges.push({
            startIndex: position,
            length: ruleLength,
          });

          const translated = this.chineseToLuatNhan(
            phrase,
            this.dictionaries.nhanByOneMeaning
          );

          this.appendTranslatedRule(
            translated,
            wrapType,
            result,
            lastTranslatedWordRef,
            vietPhraseRanges
          );

          if (this.nextCharIsChinese(chinese, position + ruleLength - 1)) {
            result.append(" ");
            lastTranslatedWordRef.value += " ";
          }

          return {
            matched: true,
            advanceBy: ruleLength,
            lastCheckEndIndex,
            ruleStartIndex: newRuleStartIndex,
            ruleLength: newRuleLength,
          };
        }
      } else if (matchIndex <= 0) {
        // No direct match but need to extend search
        const newLastCheckEndIndex = position + length - 1;

        // Try with extended phrase
        const EXTENDED_LENGTH_MAX = 100; // Define constant for magic number
        let extendedLength = EXTENDED_LENGTH_MAX;

        // Ensure we don't go beyond the text's length
        while (
          position + extendedLength < chinese.length &&
          this.isChinese(chinese[position + extendedLength - 1])
        ) {
          extendedLength++;
        }

        // Check if extended phrase contains a rule
        if (position + extendedLength <= chinese.length) {
          const extendedPhrase = chinese.substring(
            position,
            position + extendedLength
          );
          const extendedMatchIndex = this.containsLuatNhan(
            extendedPhrase,
            this.dictionaries.nhanByOneMeaning,
            resultRef,
            matchLengthRef
          );

          if (extendedMatchIndex < 0) {
            // No match in extended phrase either
            return {
              matched: false,
              advanceBy: 0,
              lastCheckEndIndex: position + extendedLength - 1,
              ruleStartIndex: newRuleStartIndex,
              ruleLength: newRuleLength,
            };
          }
        }

        return {
          matched: false,
          advanceBy: 0,
          lastCheckEndIndex: newLastCheckEndIndex,
          ruleStartIndex: newRuleStartIndex,
          ruleLength: newRuleLength,
        };
      }
    }

    return {
      matched: false,
      advanceBy: 0,
      lastCheckEndIndex,
      ruleStartIndex,
      ruleLength,
    };
  }

  /**
   * Appends a translated name to the result
   */
  private static appendTranslatedName(
    phrase: string,
    wrapType: WrapType,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string },
    vietPhraseRanges: CharRange[]
  ): void {
    let translated = this.dictionaries.onlyName[phrase];

    // Extract first meaning if multiple meanings exist
    translated = this.extractFirstMeaning(translated);

    if (wrapType === WrapType.BRACKETS) {
      translated = `[${translated}]`;
    }

    const startIndex = result.text.length;
    this.appendTranslatedWordWithIndex(
      result,
      translated,
      lastTranslatedWordRef,
      startIndex
    );

    vietPhraseRanges.push({
      startIndex: startIndex,
      length: translated.length,
    });
  }

  /**
   * Appends a translated phrase to the result
   */
  private static appendTranslatedPhrase(
    phrase: string,
    wrapType: WrapType,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string },
    vietPhraseRanges: CharRange[]
  ): void {
    let translated = this.dictionaries.vietPhraseOneMeaning[phrase];

    // Extract first meaning if multiple meanings exist
    translated = this.extractFirstMeaning(translated);

    if (wrapType === WrapType.BRACKETS) {
      translated = `[${translated}]`;
    }

    const startIndex = result.text.length;
    this.appendTranslatedWordWithIndex(
      result,
      translated,
      lastTranslatedWordRef,
      startIndex
    );

    vietPhraseRanges.push({
      startIndex: startIndex,
      length: translated.length,
    });
  }

  /**
   * Appends a translated rule to the result
   */
  private static appendTranslatedRule(
    translated: string,
    wrapType: WrapType,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string },
    vietPhraseRanges: CharRange[]
  ): void {
    const startIndex = result.text.length;
    const finalTranslated =
      wrapType === WrapType.BRACKETS ? `[${translated}]` : translated;

    this.appendTranslatedWordWithIndex(
      result,
      finalTranslated,
      lastTranslatedWordRef,
      startIndex
    );

    vietPhraseRanges.push({
      startIndex: startIndex,
      length: finalTranslated.length,
    });
  }

  /**
   * Extracts the first meaning from a multi-meaning translation
   */
  private static extractFirstMeaning(translated: string): string {
    let result = translated;

    if (result.includes("/")) {
      result = result.split("/")[0];
    }

    if (result.includes("|")) {
      result = result.split("|")[0];
    }

    if (result.includes("(")) {
      result = result.split("(")[0];
    }

    return result.trim(); // Added trim to remove extra whitespace
  }

  /**
   * Appends spacing characters if needed based on context
   */
  private static appendSpacingIfNeeded(
    chinese: string,
    position: number,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string }
  ): void {
    if (this.nextCharIsChinese(chinese, position)) {
      result.append(" ");
      lastTranslatedWordRef.value += " ";
    }

    if (this.nextCharIsNewline(chinese, position)) {
      result.append("\n");
      lastTranslatedWordRef.value += "\n";
    }
  }

  /**
   * Determines if a phrase should be translated based on the algorithm and context
   */
  private static shouldTranslateAsPhrase(
    chinese: string,
    position: number,
    length: number,
    translationAlgorithm: number,
    prioritizedName: boolean
  ): boolean {
    const phrase = chinese.substring(position, position + length);

    // Don't translate if we should prioritize names and this contains a name
    if (prioritizedName && this.containsName(chinese, position, length)) {
      return false;
    }

    // Check if this is the longest phrase or if we're using a different algorithm
    if (translationAlgorithm !== 0 && translationAlgorithm !== 2) {
      return true;
    }

    return this.isLongestPhraseInSentence(
      chinese,
      position,
      length,
      this.dictionaries.vietPhraseOneMeaning,
      translationAlgorithm
    );
  }

  /**
   * Translates a single character when no longer phrase matches
   */
  private static translateSingleCharacter(
    chinese: string,
    position: number,
    wrapType: WrapType,
    result: ResultBuffer,
    lastTranslatedWordRef: { value: string },
    chinesePhraseRanges: CharRange[],
    vietPhraseRanges: CharRange[]
  ): void {
    const resultLength = result.text.length;
    const char = chinese[position];

    chinesePhraseRanges.push({ startIndex: position, length: 1 });

    if (this.isChinese(char)) {
      // Handle Chinese character
      const hanViet = this.chineseToHanViet(char);
      const translatedText =
        wrapType !== WrapType.BRACKETS ? hanViet : `[${hanViet}]`;

      this.appendTranslatedWordWithIndex(
        result,
        translatedText,
        lastTranslatedWordRef,
        result.text.length
      );

      if (this.nextCharIsChinese(chinese, position)) {
        result.append(" ");
        lastTranslatedWordRef.value += " ";
      }

      const effectiveLength =
        hanViet.length + (wrapType !== WrapType.BRACKETS ? 0 : 2);
      vietPhraseRanges.push({
        startIndex: resultLength,
        length: effectiveLength,
      });
    } else if (this.isDirectCopyCharacter(char)) {
      // Handle characters that are copied directly
      result.append(char);
      lastTranslatedWordRef.value += char;
      vietPhraseRanges.push({ startIndex: resultLength, length: 1 });
    } else if (
      this.needsSpaceBefore(char, chinese, position, lastTranslatedWordRef)
    ) {
      // Handle characters that need spacing before them
      result.append(" " + char);
      lastTranslatedWordRef.value += " " + char;
      vietPhraseRanges.push({ startIndex: resultLength, length: 2 });
    } else {
      // Handle other characters
      result.append(" " + char);
      lastTranslatedWordRef.value += " " + char;
      vietPhraseRanges.push({ startIndex: resultLength, length: 2 });
    }
  }

  /**
   * Special handling for websites and emails to prevent incorrect translation
   * @param text The text to process
   * @returns The processed text
   */
  private static protectSpecialContent(text: string): string {
    // Mark URLs and emails with special tags that won't be translated
    return text
      .replace(/https?:\/\/\S+/g, (match) => `[[URL]]${match}[[/URL]]`)
      .replace(/\S+@\S+\.\S+/g, (match) => `[[EMAIL]]${match}[[/EMAIL]]`);
  }

  /**
   * Restores special content after translation
   * @param text The text to process
   * @returns The processed text
   */
  private static restoreSpecialContent(text: string): string {
    // Remove the special tags
    return text
      .replace(/\[\[URL\]\](.*?)\[\[\/URL\]\]/g, "$1")
      .replace(/\[\[EMAIL\]\](.*?)\[\[\/EMAIL\]\]/g, "$1");
  }

  /**
   * Determines if a character should be directly copied without modification
   */
  private static isDirectCopyCharacter(char: string): boolean {
    // Improved regex to catch more direct copy characters
    return /^[0-9A-Za-z\s\-\,\.\?\!\=\:\;\(\)\[\]\/\\]$/.test(char);
  }

  /**
   * Determines if a character needs a space before it based on context
   */
  private static needsSpaceBefore(
    char: string,
    chinese: string,
    position: number,
    lastTranslatedWordRef: { value: string }
  ): boolean {
    // Enhanced logic for proper spacing
    return (
      (char === '"' || char === "'") &&
      !lastTranslatedWordRef.value.endsWith(" ") &&
      !lastTranslatedWordRef.value.endsWith(".") &&
      !lastTranslatedWordRef.value.endsWith("?") &&
      !lastTranslatedWordRef.value.endsWith("!") &&
      !lastTranslatedWordRef.value.endsWith("\t") &&
      position < chinese.length - 1 &&
      chinese[position + 1] !== " " &&
      chinese[position + 1] !== ","
    );
  }

  /**
   * Improves the formatting of colon-separated text (common in web content)
   * @param text The text to process
   * @returns The processed text with proper colon formatting
   */
  private static improveColonFormatting(text: string): string {
    // Fix chapter numbers followed by colons
    return text
      .replace(/Chương\s+(\d+):{2}/g, "Chương $1:")
      .replace(/(\d+):{2}/g, "$1:");
  }

  /**
   * Translates Chinese text in an HTML page to Vietnamese using chineseToVietPhraseOneMeaning
   * @param htmlContent The HTML content as a string
   * @param wrapType Type of wrapping (0 = none, 1 = brackets)
   * @param translationAlgorithm Algorithm to use for translation
   * @param prioritizedName Whether to prioritize names
   * @returns The translated HTML content as a string
   */
  public static translateHtmlPage(
    htmlContent: string,
    wrapType: number = 0,
    translationAlgorithm: number = 1,
    prioritizedName: boolean = true,
    isFormatResult: boolean = false
  ): string {
    // Parse HTML content into a DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Function to process text nodes recursively
    function processNode(node: Node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        // Skip empty text nodes or those with only whitespace
        if (node.textContent.trim().length === 0) {
          return;
        }

        // Check if the text contains Chinese characters
        const hasChinese = /[\u4e00-\u9fff]/.test(node.textContent);
        if (hasChinese) {
          // Translate the text using chineseToVietPhraseOneMeaning
          const translationResult =
            TranslationService.chineseToVietPhraseOneMeaning(
              node.textContent,
              wrapType,
              translationAlgorithm,
              prioritizedName,
              isFormatResult
            );
          // uppercase the first letter of the translated text
          translationResult.text = TranslationService.toUpperCase(translationResult.text.trim());

          // Replace the text node's content with the translated text
          node.textContent = translationResult.text;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script and style elements to avoid translating code
        const tagName = (node as Element).tagName.toLowerCase();
        if (tagName === "script" || tagName === "style") {
          return;
        }
        // Process child nodes
        for (const child of Array.from(node.childNodes)) {
          processNode(child);
        }
      }
    }

    // Process all nodes in the document body
    processNode(doc.body);

    // Serialize the DOM back to a string
    return new XMLSerializer().serializeToString(doc);
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
        // remove "了" if the sentence ends with "了" not followed by a Chinese character
        .replace(/(?<=\p{Script=Han})了/gu, "")
        // .replace(/了$/gim, "")
        .replaceAll("　　", "")
        .replaceAll("，", ",")
        .replaceAll("。", ".")
        .replaceAll("：", ":")
        .replaceAll("？", "?")
        .replaceAll("！", "!")
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

      .replaceAll("“", '"')
      .replaceAll("”", '"')
      .replaceAll("no-meaning", "")
      .replaceAll("、", ",")
      .replaceAll(" ,", ",")
      .replaceAll(" .", ".");
    const sentences = text.split("\n");
    const formattedSentences = sentences.map((sentence) => {
      let trimmedSentence = sentence.trim();
      // console.log(trimmedSentence);
      if (!trimmedSentence) return "";

      // Capitalize the first letter of the sentence
      if (trimmedSentence.length > 0) {
        // If the sentence begin with a quote, capitalize the first letter after the quote
        if (trimmedSentence.startsWith('"')) {
          const quoteIndex = trimmedSentence.indexOf('"', 0);
          if (quoteIndex !== -1) {
            if (trimmedSentence.charAt(quoteIndex + 1) === " ") {
              // remove the space after the quote
              trimmedSentence =
                trimmedSentence.slice(0, quoteIndex + 1) +
                trimmedSentence.slice(quoteIndex + 2);
            }
            trimmedSentence =
              trimmedSentence.slice(0, quoteIndex + 1) +
              trimmedSentence.charAt(quoteIndex + 1).toUpperCase() +
              trimmedSentence.slice(quoteIndex + 2);
          }
        } else if (trimmedSentence.startsWith("'")) {
          const quoteIndex = trimmedSentence.indexOf("'", 0);
          if (quoteIndex !== -1) {
            if (trimmedSentence.charAt(quoteIndex + 1) === " ") {
              // remove the space after the quote
              trimmedSentence =
                trimmedSentence.slice(0, quoteIndex + 1) +
                trimmedSentence.slice(quoteIndex + 2);
            }
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
