import * as OpenCC from "opencc-js";

// Simplified Chinese -> Traditional Chinese converter
const converter = OpenCC.Converter({ from: "cn", to: "twp" });

/**
 * Convert Simplified Chinese text to Traditional Chinese.
 * Returns original text if input is null/undefined/empty.
 */
export function s2t(text) {
  if (!text) return text;
  return converter(String(text));
}
