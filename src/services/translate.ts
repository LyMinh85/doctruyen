// `// Types and interfaces
// interface TransformData {
//   str: string;
//   strTrans?: string;
//   tu: Record<string, string>;
//   chuoi?: string;
//   goc?: string;
//   index?: number;
//   start?: number;
//   end?: number;
//   hv?: string;
// }

// interface TranslationResult {
//   vp: string;
//   hv: string;
//   opp: number;
//   time?: string;
//   tt?: string;
// }

// interface NameInfo {
//   name: string;
//   loop: number;
//   hv: string;
//   vp: string;
// }

// interface WebsiteBook {
//   url: string;
//   title: string;
//   img: string;
//   author?: string;
//   newchap?: string;
// }

// interface WebsiteCategory {
//   name: string;
//   url: string;
// }

// interface WebsiteResult {
//   books: WebsiteBook[];
//   cats?: WebsiteCategory[];
//   count?: number | null;
// }

// interface SiteConfig {
//   url: string;
//   selector: {
//     list: {
//       css: string;
//       img: string;
//       title: string;
//       author: string;
//       new: string;
//       pag: {
//         total: string;
//       }
//     };
//     category: {
//       css: string;
//       index: number;
//     };
//   };
// }

// // Configuration variables
// let diclocal = false;
// let lang = 'zh'; // Default language
// const corsproxys: string[] = ['https://corsproxy.io']; // CORS proxy URLs
// // const dicNames: Record<string, string> = {};
// // const dicNames2: Record<string, string> = {};
// // const dicVP: Record<string, string> = {};
// // const dicHV: Record<string, string> = {};
// // const dicNhan: Record<string, string> = {};

// /**
//  * Translation service class for handling translations from Asian languages
//  */
// /**
//  * Translation service for East Asian (Chinese, Japanese, Korean) text
//  * 
//  * This service provides functionality to translate text from various East Asian languages
//  * (primarily Chinese, Korean, and Japanese) using dictionary-based substitution.
//  * 
//  * Features include:
//  * - Dictionary-based text translation
//  * - Han-Viet transliteration for Chinese characters
//  * - Pattern matching for special phrase constructs
//  * - Text processing with capitalization and formatting
//  * - Language detection for Chinese, Japanese, and Korean scripts
//  * - HTML content handling and translation
//  * - Name analysis for character identification
//  * - Web scraping with content extraction and translation
//  * 
//  * The service uses multiple dictionaries for accurate translations:
//  * - Names dictionaries for proper nouns
//  * - VietPhrase dictionary for common phrases
//  * - Hán-Việt dictionary for character-by-character transliteration
//  * - Pattern dictionary for special linguistic constructs
//  * 
//  * Translation can be performed locally or using a remote API endpoint.
//  */
// export class TranslationService {
//   private static operationCounter = 0;
//   private static dicNames: Record<string, string> = {};
//   private static dicNames2: Record<string, string> = {};
//   private static dicVP: Record<string, string> = {};
//   private static dicHV: Record<string, string> = {};
//   private static dicNhan: Record<string, string> = {};

  
//   // Regular expressions for detecting different Asian languages
//   private static readonly languageRegex = {
//     zh: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/,  // Chinese
//     ko: /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/,  // Korean
//     jp: /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/  // Japanese
//   };

//   /**
//    * Load dictionaries for translation
//    * @param dictionaries - Object containing dictionaries to load
//    * @param dictionaries.names - Names dictionary
//    * @param dictionaries.names2 - Secondary names dictionary
//    * @param dictionaries.vp - VietPhrase dictionary
//    * @param dictionaries.hv - Hán Việt dictionary
//    * @param dictionaries.nhan - Pattern dictionary
//    */
//   public static setDictionaries(dictionaries: {
//     names?: Record<string, string>;
//     names2?: Record<string, string>;
//     vietphrase?: Record<string, string>;
//     hanViet?: Record<string, string>;
//     luatNhan?: Record<string, string>;
//   }): void {
//     if (dictionaries.names) {
//       this.dicNames = { ...this.dicNames, ...dictionaries.names };
//     }
    
//     if (dictionaries.names2) {
//       this.dicNames2 = { ...this.dicNames2, ...dictionaries.names2 };
//     }
    
//     if (dictionaries.vietphrase) {
//       this.dicVP = { ...this.dicVP, ...dictionaries.vietphrase };
//     }
    
//     if (dictionaries.hanViet) {
//       this.dicHV = { ...this.dicHV, ...dictionaries.hanViet };
//     }
    
//     if (dictionaries.luatNhan) {
//       this.dicNhan = { ...this.dicNhan, ...dictionaries.luatNhan };
//     }
    
//     console.log('Dictionaries loaded:', {
//       names: Object.keys(this.dicNames).length,
//       names2: Object.keys(this.dicNames2).length,
//       vp: Object.keys(this.dicVP).length,
//       hv: Object.keys(this.dicHV).length,
//       nhan: Object.keys(this.dicNhan).length
//     });
//   }

//   /**
//    * Set the source language for translation
//    * @param language - Language code (zh, ko, jp)
//    */
//   public static setLanguage(language: 'zh' | 'ko' | 'jp'): void {
//     lang = language;
//   }

//   /**
//    * Set the local dictionary mode
//    * @param useLocal - Whether to use local dictionary
//    */
//   public static setLocalDictionary(useLocal: boolean): void {
//     diclocal = useLocal;
//   }

//   /**
//    * Checks if the text contains characters from the target language
//    * @param text - Text to check
//    * @returns True if text contains characters in the target language
//    */
//   private static containsLanguageCharacters(text: string): boolean {
//     return this.languageRegex[lang as keyof typeof this.languageRegex].test(text);
//   }

//   /**
//    * Process text transformation
//    * @param data - Object containing text and transformation data
//    * @returns The transformed data
//    */
//   private static transformText(data: TransformData): TransformData {
//     let text = data.str;

//     if (!this.containsLanguageCharacters(text)) {
//       data.strTrans = text;
//     } else {
//       // Replace specific character patterns
//       text = text.replace(/([^,.])ç„([^,.])/gmi, "$1$2");
//       text = text.replace(/äº†(\s*[,\.])/g, "rá»\"i$1");

//       // Apply dictionary replacements
//       for (const pattern in this.dicNhan) {
//         if (Object.hasOwnProperty.call(this.dicNhan, pattern)) {
//           const regex = new RegExp(pattern.replaceAll("{0}", "(.*)"), "igm");
//           const matches = text.match(regex);
//           const segments = text.split(regex);

//           if (matches) {
//             matches.forEach(match => {
//               const replacement = " " + this.dicNhan[pattern].replaceAll("{0}", segments[1]) + " ";
//               data.tu[match] = replacement;
//               text = text.replaceAll(match, replacement);
//             });
//             break;
//           }
//         }
//       }

//       data.strTrans = text;
//     }

//     return data;
//   }

//   /**
//    * Process text recursively to translate characters
//    * @param text - Text to process
//    * @returns Processed text
//    */
//   private static processTextRecursively(text: string): string {
//     try {
//       if (!this.containsLanguageCharacters(text) || 
//           (text = this.lookupDictionary(text) || text, !this.containsLanguageCharacters(text))) {
//         return text;
//       }

//       // Group characters by type
//       const segments: string[] = [];
//       let currentSegment = "";

//       for (let i = 0; i < text.length; i++) {
//         if (i == 0 || (i > 0 && this.containsLanguageCharacters(text[i]) == this.containsLanguageCharacters(text[i - 1]))) {
//           currentSegment += text[i];
//         } else {
//           segments.push(currentSegment);
//           currentSegment = text[i];
//         }
//       }

//       if (currentSegment !== "") {
//         segments.push(currentSegment);
//       }

//       if (segments.length == 0) {
//         segments.push(text);
//       }

//       // Process each segment
//       for (let i = 0; i < segments.length; i++) {
//         const commaSegments = segments[i].split(",");
//         const processedSegments: string[] = [];

//         commaSegments.forEach(segment => {
//           if (segment = this.lookupDictionary(segment) || segment, this.containsLanguageCharacters(segment)) {
//             let length = segment.length;
//             let processed = this.lookupDictionary(segment.substring(0, length), true);

//             // Try reducing length until a match is found
//             while (processed && this.containsLanguageCharacters(processed) && length > 0) {
//               length--;
//               processed = this.lookupDictionary(segment.substring(0, length), true);
//             }

//             if (length >= 0) {
//               segment = processed + " " + this.processTextRecursively(segment.substring(length));
//             }
//           }

//           processedSegments.push(segment.trim());
//         });

//         segments[i] = processedSegments.join(", ");
//         this.operationCounter++;
//       }

//       return segments.join(" ").replace(/\r/g, "");
//     } catch (error) {
//       console.log(text);
//       console.log("error", error);
//       return text;
//     }
//   }

//   /**
//    * Look up a term in various dictionaries
//    * @param term - Term to look up
//    * @param fallback - Whether to return the original term if not found
//    * @returns Translation or null if not found
//    */
//   private static lookupDictionary(term: string, fallback?: boolean): string | null {
//     if (!term || term.trim().length == 0) return term;

//     // Try different dictionaries in order
//     let translation = this.dicNames2[term];

//     if (!translation) {
//       translation = this.dicNames[term];
//     }

//     if (!translation) {
//       translation = this.dicVP[term];
//       if (translation) {
//         if (translation.includes("/")) {
//           translation = translation.split("/")[0];
//         }
//         if (translation.includes("|")) {
//           translation = translation.split("|")[0];
//         }
//         if (lang == "ko") {
//           translation = translation.split(",")[0];
//         }
//       }
//     }

//     if (!translation) {
//       translation = this.dicHV[term];
//     }

//     if (!translation) {
//       return fallback ? term : null;
//     }

//     return translation;
//   }

//   /**
//    * Process text to translate characters
//    * @param text - Text to translate
//    * @returns Translated text
//    */
//   private static translateText(text: string): string {
//     if (!this.containsLanguageCharacters(text)) {
//       return text;
//     }

//     text = this.lookupDictionary(text) || text;

//     if (!this.containsLanguageCharacters(text)) {
//       return text;
//     }

//     const data: TransformData = { str: text, tu: {} };
//     text = this.transformText(data).strTrans || text;
//     text = this.processTextRecursively(text);

//     return text;
//   }

//   /**
//    * Transliterate text using Hán-Việt dictionary
//    * @param text - Text to transliterate
//    * @returns Transliterated text
//    */
//   public static transliterateHanViet(text: string): string {
//     const result: string[] = [];

//     for (let i = 0; i < text.length; i++) {
//       if (this.containsLanguageCharacters(text[i])) {
//         result.push((this.dicHV[text[i]] || text[i]) + " ");
//       } else {
//         result.push(text[i]);
//       }
//     }

//     return result.join("").trim();
//   }

//   /**
//    * Process text for translation
//    * @param text - Text to process
//    * @returns Processed text
//    */
//   public static processTextForTranslation(text: string): string {
//     if (this.operationCounter > 10000000 || text.length == 0 || !this.containsLanguageCharacters(text)) {
//       return text;
//     }

//     if (text.length == 1) {
//       text = this.lookupDictionary(text) || text;
//       return text;
//     }

//     if (!this.containsLanguageCharacters(text)) {
//       return text;
//     }

//     const translated = this.translateText(text);

//     return translated.length == 0 ? text : translated;
//   }

//   /**
//    * Clean text by normalizing punctuation and whitespace
//    * @param text - Text to clean
//    * @returns Cleaned text
//    */
//   public static cleanText(text: string): string {
//     const punctuationMap: Record<string, string> = {
//       "ă€‚": ".",
//       "ï¼Œ": ",",
//       "ă€": ",",
//       "â€œ": '"',
//       "â€": '"',
//       "ï¼": ":"
//     };

//     for (const char in punctuationMap) {
//       if (Object.hasOwnProperty.call(punctuationMap, char)) {
//         text = text.replaceAll(char, punctuationMap[char]);
//       }
//     }

//     return text.trim()
//       .replace(/\r/g, "")
//       .replace(/&nbsp;/igm, " ")
//       .replace(/&ensp;/igm, "  ")
//       .replace(/&emsp;/igm, "    ")
//       .replace(/(?<=\p{Script=Han})的(?=\p{Script=Han})/gu, '');
//   }

//   /**
//    * Check if character is a letter
//    * @param char - Character to check
//    * @returns True if character is a letter
//    */
//   private static isLetter(char: string): boolean {
//     return char.toLowerCase() != char.toUpperCase();
//   }

//   /**
//    * Capitalize text
//    * @param text - Text to capitalize
//    * @returns Capitalized text
//    */
//   private static capitalizeText(text: string): string {
//     return this.formatText(text);
//   }

//   /**
//    * Format text with capitalization
//    * @param text - Text to format
//    * @returns Formatted text
//    */
//   private static formatText(text: string): string {
//     let startIndex = 0;

//     if (text.charAt(0) == "<") {
//       startIndex = text.indexOf(">") + 1;
//     }

//     // Find first letter to capitalize
//     while ((text.charAt(startIndex) == "" || !this.isLetter(text.charAt(startIndex))) && startIndex < text.length - 1) {
//       startIndex++;
//     }

//     return text.substring(0, startIndex) +
//       text.charAt(startIndex).toUpperCase() +
//       text.slice(startIndex + 1);
//   }

//   /**
//    * Process a sentence for translation
//    * @param text - Text to process
//    * @param capitalize - Whether to capitalize the result
//    * @returns Processed text data
//    */
//   private static processSentence(text: string, capitalize?: boolean): TransformData {
//     const punctuation = [":", ".", "?", "!"];
//     let punctIndex = 0;
//     let endIndex = text.indexOf(punctuation[punctIndex]);

//     // Find first punctuation mark
//     while (endIndex == -1 && punctIndex < punctuation.length - 1) {
//       punctIndex++;
//       endIndex = text.indexOf(punctuation[punctIndex]);
//     }

//     if (endIndex != -1) {
//       text = text.substring(0, endIndex);
//     }

//     const result: TransformData = {
//       str: text.trim(),
//       tu: {}
//     };

//     let transformed = this.transformText(result).strTrans || "";
//     transformed = this.processTextForTranslation(transformed);

//     if (transformed.trim().length > 0 && endIndex != -1) {
//       transformed += punctuation[punctIndex];
//       if (punctuation[punctIndex] == ":") {
//         transformed = transformed.trim() + " ";
//       }
//     }

//     result.chuoi = capitalize === true ? this.capitalizeText(transformed) : this.formatText(transformed);
//     result.goc = text;
//     result.index = endIndex;

//     return result;
//   }

//   /**
//    * Apply markdown formatting
//    * @param text - Text to format
//    * @param isHtml - Whether text is HTML
//    * @returns Formatted text
//    */
//   private static applyMarkdown(text: string, isHtml?: boolean): string {
//     if (!isHtml) {
//       text = text.trim().replace(/\r/g, "").replace(/ , /igm, ", ");
//       text = text.replace(/"([^"]*)"/igm, '<i>"$1"</i>');
//       text = text.replace(/^(.+\d+.+chÆ°Æ¡ng.+\n)/, "<h2 class='chap-title'>$1</h2>");
//       text = text.replace(/\n([^\n])/igm, "<br/><br/>$1").replace(/\n/g, "<br/>");
//       text = text.replace(/\.([^.\s/n]+)/ig, ". $1");
//       text = text.replace(/(\s+)\.\s/ig, ". ");
//       text = text.replace(/&nbsp;/igm, " ");
//     }

//     return text;
//   }

//   /**
//    * Check if text contains HTML
//    * @param text - Text to check
//    * @returns True if text contains HTML
//    */
//   public static containsHtml(text: string): boolean {
//     const doc = new DOMParser().parseFromString(text, "text/html");
//     return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
//   }

//   /**
//    * Process text with formatting
//    * @param text - Text to translate
//    * @param applyFormat - Whether to apply formatting
//    * @param isHtml - Whether text is HTML
//    * @param operations - Operation counter
//    * @param disableHighlight - Whether to disable highlighting
//    * @returns Translation results
//    */
//   public static processTextWithFormatting(
//     text: string, 
//     applyFormat?: boolean, 
//     isHtml?: boolean, 
//     operations?: number, 
//     disableHighlight?: boolean
//   ): TranslationResult {
//     const startTime = performance.now();
//     text = this.cleanText(text);

//     let vietPhrase = "";
//     let hanViet = "";
//     let maxIterations = 100000000;
//     let position = 0;

//     operations = operations || 0;

//     text.split("\n").forEach(line => {
//       const lineLength = line.length;

//       while (line && line.length > 0 && maxIterations > 0) {
//         const processedSentence = this.processSentence(line);

//         processedSentence.start = position;
//         processedSentence.end = position + lineLength;
//         processedSentence.hv = applyFormat ? this.applyMarkdown(this.capitalizeText(this.transliterateHanViet(line))) : this.transliterateHanViet(line);

//         hanViet += processedSentence.hv;

//         if (applyFormat && !disableHighlight) {
//           vietPhrase += `<p s=${processedSentence.start} e=${processedSentence.end}> ${processedSentence.chuoi}</p>`;
//         } else {
//           vietPhrase += processedSentence.chuoi;
//         }

//         if (processedSentence.index === -1) break;

//         line = line.substring(parseInt(String(processedSentence.index + 1)));
//         maxIterations--;
//       }

//       position += lineLength + 1;
//       vietPhrase += "\n";
//       hanViet += "\n";
//     });

//     const processTime = "Thá»i gian xá»­ lĂ½: " + ((performance.now() - startTime) / 1000).toFixed(2) + "s - Opp:" +
//       operations.toLocaleString("vi-VN") + " - Tá»«:" + text.length.toLocaleString("vi-VN");

//     return {
//       vp: applyFormat ? this.applyMarkdown(vietPhrase, isHtml) : vietPhrase,
//       hv: applyFormat ? this.applyMarkdown(hanViet, isHtml) : hanViet,
//       opp: operations,
//       time: processTime
//     };
//   }

//   /**
//    * Process text with capitalization
//    * @param text - Text to process
//    * @param applyFormat - Whether to apply formatting
//    * @param isHtml - Whether text is HTML
//    * @param operations - Operation counter
//    * @param disableHighlight - Whether to disable highlighting
//    * @returns Translation results
//    */
//   public static processWithCapitalization(
//     text: string, 
//     applyFormat?: boolean, 
//     isHtml?: boolean, 
//     operations?: number, 
//     disableHighlight?: boolean
//   ): TranslationResult {
//     const isHtmlContent = isHtml || this.containsHtml(text);
//     let vietPhrase = "";
//     let hanViet = "";
//     let maxIterations = 100000000;
//     let position = 0;

//     operations = operations || 0;

//     text.split("\n").forEach(line => {
//       const lineLength = line.length;

//       while (line && line.length > 0 && maxIterations > 0) {
//         const processedSentence = this.processSentence(line, true);

//         processedSentence.start = position;
//         processedSentence.end = position + lineLength;
//         processedSentence.hv = applyFormat ? this.applyMarkdown(this.capitalizeText(this.transliterateHanViet(line))) : this.transliterateHanViet(line);

//         hanViet += processedSentence.hv;

//         if (applyFormat && !disableHighlight) {
//           vietPhrase += `<p s=${processedSentence.start} e=${processedSentence.end}> ${processedSentence.chuoi}</p>`;
//         } else {
//           vietPhrase += processedSentence.chuoi;
//         }

//         if (processedSentence.index === -1) break;

//         line = line.substring(parseInt(String(processedSentence.index + 1)));
//         maxIterations--;
//       }

//       position += lineLength + 1;
//       vietPhrase += "\n";
//       hanViet += "\n";
//     });

//     return {
//       vp: applyFormat ? this.applyMarkdown(vietPhrase, isHtmlContent) : vietPhrase,
//       hv: applyFormat ? this.applyMarkdown(hanViet, isHtmlContent) : hanViet,
//       opp: operations
//     };
//   }

//   /**
//    * Analyze text for names
//    * @param text - Text to analyze
//    * @returns Array of names found
//    */
//   public static async analyzeNames(text: string): Promise<NameInfo[]> {
//     if (this.containsHtml(text)) return [];

//     const names: NameInfo[] = [];

//     // if (diclocal === false) {
//     //   const options = {
//     //     method: "POST",
//     //     body: JSON.stringify({ tt: this.cleanText(text) }),
//     //     headers: {
//     //       Accept: "application/json",
//     //       "Content-Type": "application/json"
//     //     }
//     //   };

//     //   return await (await fetch("https://proxy.vietphrase.info/analysNames", options)).json();
//     // }

//     const startTime = performance.now();

//     // Find sequences of 3 or more Asian characters
//     const matches = text.match(/(\n*)([\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]{3})/g);

//     if (matches) {
//       matches.forEach(match => {
//         match = match.replaceAll("\n", "").trim();

//         const nameInfo: NameInfo = {
//           name: match,
//           loop: text.match(new RegExp(match, "igm"))?.length || 0,
//           hv: this.capitalizeText(this.applyMarkdown(this.transliterateHanViet(match))),
//           vp: this.capitalizeText(this.applyMarkdown(this.processTextForTranslation(match)))
//         };

//         if (nameInfo.loop > 1 && names.findIndex(n => n.name == match) == -1) {
//           names.push(nameInfo);
//         }
//       });

//       names.sort((a, b) => b.loop - a.loop);
//     }

//     const endTime = performance.now();
//     console.log("Thá»i gian xá»­ lĂ½: " + ((endTime - startTime) / 1000).toFixed(2) + "s");

//     return names;
//   }

//   /**
//    * Translate text with options
//    * @param text - Text to translate
//    * @param disableHighlight - Whether to disable highlighting
//    * @param translationType - Type of translation
//    * @returns Translation results
//    */
//   public static async translate(
//     text: string, 
//     disableHighlight?: boolean, 
//     translationType?: number
//   ): Promise<TranslationResult> {
//     const startTime = performance.now();
//     const result: TranslationResult = { vp: "", hv: "", opp: 0 };

//     // if (diclocal === false) {
//     //   const options = {
//     //     method: "POST",
//     //     body: JSON.stringify({
//     //       tt: this.cleanText(text),
//     //       dis: disableHighlight,
//     //       typedich: translationType
//     //     }),
//     //     headers: {
//     //       Accept: "application/json",
//     //       "Content-Type": "application/json"
//     //     }
//     //   };

//     //   return await (await fetch("https://proxy.vietphrase.info/tran", options)).json();
//     // }

//     if (!this.containsHtml(text)) {
//       return this.processTextWithFormatting(text, true);
//     }

//     text = this.cleanText(text).replace(/\n/igm, "").trim();

//     if (translationType == 1) {
//       // Process Asian characters in the text
//       result.vp = text.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]+/igmu, (match) => {
//         result.opp++;
//         return this.processTextWithFormatting(match, true, false, result.opp, disableHighlight).vp;
//       });

//       // Fix punctuation
//       result.vp = result.vp.replace(/,(\w|\W)/igmu, (match, char) => {
//         return ", " + char.toLowerCase();
//       });
//       result.vp = result.vp.replace(/:"/igmu, ': "');

//       // Process Han-Viet transliteration
//       result.hv = text.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]+/igmu, (match) => {
//         result.opp++;
//         return this.transliterateHanViet(match);
//       });

//       // Fix punctuation in Han-Viet
//       result.hv = result.hv.replace(/,(\w|\W)/igmu, (match, char) => {
//         return ", " + char.toLowerCase();
//       });
//       result.hv = result.hv.replace(/:"/igmu, ': "');
//     } else {
//       // Process HTML content between tags
//       result.vp = text.replace(/>?([^>]+)</igmu, (match, content) => {
//         result.opp++;
//         return (match[0] == ">" ? ">" : "") +
//           this.processTextWithFormatting(content, true, false, result.opp, disableHighlight).vp + "<";
//       });

//       // Process HTML attributes
//       result.vp = result.vp.replace(/(title|placeholder|alt|value)="([^"]+)"/igmu, (match) => {
//         result.opp++;
//         return this.processTextForTranslation(match);
//       });

//       // Process Han-Viet for HTML content
//       result.hv = text.replace(/>?([^>]+)</igmu, (match, content) => {
//         result.opp++;
//         return (match[0] == ">" ? ">" : "") +
//           this.processTextWithFormatting(content, true, false, result.opp, disableHighlight).hv + "<";
//       });

//       // Process HTML attributes for Han-Viet
//       result.hv = result.hv.replace(/(title|placeholder|alt|value)="([^"]+)"/igmu, (match) => {
//         result.opp++;
//         return this.transliterateHanViet(match);
//       });
//     }

//     result.tt = text;

//     const endTime = performance.now();
//     result.time = "Thá»i gian xá»­ lĂ½: " + ((endTime - startTime) / 1000).toFixed(2) + "s - Opp:" +
//       result.opp.toLocaleString("vi-VN") + " - Tá»«:" + text.length.toLocaleString("vi-VN");

//     console.log(result);
//     return result;
//   }

//   /**
//    * Download text as a file
//    * @param filename - Name of the file
//    * @param content - Content to download
//    */
//   public static downloadFile(filename: string, content: string): void {
//     const element = document.createElement("a");
//     element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
//     element.setAttribute("download", filename);
//     element.style.display = "none";
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//   }

//   /**
//    * Extract the first sentence from text
//    * @param text - Text to process
//    * @returns First sentence
//    */
//   public static extractFirstSentence(text: string): string {
//     text = text.replace(/^(\s*)[''",.?!]/, "");
//     return text.split(/[''",.?!]/)[0].trim();
//   }

//   /**
//    * Remove HTML tags from text
//    * @param text - Text with HTML
//    * @returns Plain text
//    */
//   public static stripHtml(text: string): string {
//     return text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");
//   }

//   /**
//    * Find term in text by translation
//    * @param text - Text to search in
//    * @param translation - Translation to find
//    * @returns Original term
//    */
//   public static findTermByTranslation(text: string, translation: string): string {
//     if (!translation || translation.trim().length == 0) return "";

//     let position = 0;
//     translation = translation.toLowerCase();
//     let wordCount = translation.split(" ").length;
//     let segment = text.substring(position, position + wordCount);

//     while (position < text.length && wordCount > 0 &&
//       this.processTextForTranslation(segment).toLowerCase().trim() != translation) {
//       position++;
//       segment = text.substring(position, position + wordCount);

//       if (position == text.length) {
//         wordCount--;
//         position = 0;
//       }
//     }

//     return segment;
//   }

//   /**
//    * Get base URL from a URL string
//    * @param url - URL to process
//    * @returns Base URL
//    */
//   public static getBaseUrl(url: string): string {
//     const parsedUrl = new URL(url);
//     return parsedUrl.protocol + "//" + parsedUrl.hostname;
//   }

//   /**
//    * Load content from URL with encoding
//    * @param url - URL to load
//    * @param encoding - Character encoding
//    * @returns Promise with content
//    */
//   public static loadUrl(url: string, encoding: string): Promise<{ status: number; statusText: string }> {
//     return new Promise(function (resolve) {
//       const xhr = new XMLHttpRequest();
//       xhr.open("GET", url, true);
//       xhr.responseType = "arraybuffer";

//       xhr.onload = function () {
//         if (this.status == 200) {
//           const dataView = new DataView(this.response);
//           let decoder = new TextDecoder(encoding);
//           let content = decoder.decode(dataView);

//           // Try to detect charset from content
//           const charsetRegex = /charset="?([^"]*)"\s*\/?>/gmi;
//           const match = charsetRegex.exec(content);
//           const detectedCharset = match ? match[1] : "utf-8";

//           if (encoding.toLowerCase() != detectedCharset.toLocaleLowerCase()) {
//             decoder = new TextDecoder(detectedCharset);
//             content = decoder.decode(dataView);
//           }

//           resolve({
//             status: this.status,
//             statusText: content
//           });
//         } else {
//           resolve({
//             status: this.status,
//             statusText: xhr.statusText
//           });
//         }
//       };

//       xhr.onerror = function () {
//         resolve({
//           status: this.status,
//           statusText: xhr.statusText
//         });
//       };

//       xhr.send();
//     });
//   }

//   /**
//    * Load URL content with fallback to CORS proxy
//    * @param url - URL to load
//    * @param encoding - Character encoding
//    * @returns Content or null if failed
//    */
//   public static async loadUrlContent(url: string, encoding?: string): Promise<string | null> {
//     if (encoding == null) {
//       encoding = "utf-8";
//     }

//     let response = await this.loadUrl(url, encoding);

//     if (response.status == 0) {
//       response = await this.loadUrl(corsproxys[0] + "/" + encodeURIComponent(url), encoding);
//     }

//     return response.status == 200 ? this.cleanText(response.statusText) : null;
//   }

//   /**
//    * Process website content and extract book information
//    * @param site - Site configuration
//    * @param content - HTML content
//    * @param listOnly - Whether to return only the book list
//    * @param includeCategories - Whether to include categories
//    * @returns Book information
//    */
//   public static async processWebsite(
//     site: SiteConfig, 
//     content: string, 
//     listOnly?: boolean, 
//     includeCategories?: boolean
//   ): Promise<WebsiteResult> {
//     content = (await this.translate(content)).vp;

//     const doc = new DOMParser().parseFromString(content, "text/html");
//     const books: WebsiteBook[] = [];
//     const selectors = site.selector;

//     if (selectors.list.css) {
//       selectors.list.css.split(",").forEach(selector => {
//         doc.querySelectorAll(selector).forEach(element => {
//           const book: WebsiteBook = {
//             url: "",
//             title: "",
//             img: ""
//           };
          
//           const imageElement = element.querySelector(selectors.list.img) as HTMLImageElement;
//           const titleElement = element.querySelector(selectors.list.title) as HTMLAnchorElement;

//           if (titleElement) {
//             book.url = site.url + titleElement.getAttribute("href");
//             book.title = titleElement.innerText;
//             book.img = imageElement.getAttribute("src") || "";

//             const authorElement = element.querySelector(selectors.list.author) as HTMLElement;
//             if (authorElement) {
//               book.author = authorElement.innerText;
//             }

//             const newChapterElement = element.querySelector(selectors.list.new) as HTMLElement;
//             if (newChapterElement) {
//               book.newchap = newChapterElement.innerText;
//             }

//             books.push(book);
//           }
//         });
//       });
//     }

//     if (listOnly !== true) {
//       const categories: WebsiteCategory[] = [];

//       if (includeCategories && selectors) {
//         selectors.category.css.split(",").forEach(selector => {
//           doc.querySelectorAll(selector).forEach(element => {
//             const linkElement = element.querySelector("a") as HTMLAnchorElement;

//             if (linkElement.innerText.trim() != "" &&
//               (linkElement.getAttribute("href") == "/" ||
//                 linkElement.getAttribute("href")?.includes(".html"))) {
//               categories.push({
//                 name: linkElement.innerText,
//                 url: site.url + linkElement.getAttribute("href")
//               });
//             }
//           });
//         });

//         // Handle category removal or limiting
//         if (selectors.category.index > 0) {
//           categories.splice(selectors.category.index);
//         }
//       }

//       // Check for pagination
//       const paginationElement = doc.querySelector(selectors.list.pag.total) as HTMLAnchorElement;

//       return {
//         books: books,
//         cats: categories,
//         count: paginationElement ? parseInt(paginationElement.getAttribute("href")?.replace(/^\D+/g, "") || "0") : null
//       };
//     }

//     return { books: books };
//   }

//   /**
//    * Parse dictionary file content into key-value pairs
//    * @param content - Raw text content of dictionary file
//    * @returns Record containing key-value pairs from the dictionary
//    */
//   public static parseDictionaryFile(content: string): Record<string, string> {
//     const dictionary: Record<string, string> = {};
    
//     if (!content || content.trim().length === 0) {
//       return dictionary;
//     }
    
//     // Split the content by new lines and process each line
//     const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    
//     for (const line of lines) {
//       // Skip comments and empty lines
//       if (line.startsWith('#') || line.trim().length === 0) {
//         continue;
//       }
      
//       // Split each line by the first tab or equal sign
//       const parts = line.split(/[=\t](.+)/);
      
//       if (parts.length >= 2) {
//         const key = parts[0].trim();
//         const value = parts[1].trim();
        
//         if (key.length > 0 && value.length > 0) {
//           dictionary[key] = value;
//         }
//       }
//     }
    
//     return dictionary;
//   }
// }`