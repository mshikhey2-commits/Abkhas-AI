
/**
 * Normalizes Arabic text to handle common variations and improve search accuracy.
 */
export const normalizeArabic = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    // Remove Arabic diacritics (Harakat)
    .replace(/[\u064B-\u065F\u0670]/g, "");
};

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for typo tolerance.
 */
export const getEditDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Checks if a query string is "close enough" to a target string.
 */
export const isFuzzyMatch = (query: string, target: string, threshold = 2): boolean => {
  const q = normalizeArabic(query);
  const t = normalizeArabic(target);

  if (t.includes(q)) return true;

  const distance = getEditDistance(q, t);
  // Tolerance scale based on length
  const maxAllowed = q.length <= 3 ? 0 : q.length <= 5 ? 1 : threshold;
  
  return distance <= maxAllowed;
};

/**
 * Calculates a similarity score (0 to 1) between query and product.
 */
export const calculateMatchScore = (query: string, product: any): number => {
  const q = normalizeArabic(query);
  const words = q.split(/\s+/);
  let totalScore = 0;

  const fields = [
    { text: normalizeArabic(product.name), weight: 1.0 },
    { text: normalizeArabic(product.brand), weight: 0.6 },
    { text: normalizeArabic(product.category), weight: 0.4 },
    ...product.tags.map((tag: string) => ({ text: normalizeArabic(tag), weight: 0.5 }))
  ];

  for (const word of words) {
    if (word.length < 2) continue;
    
    let bestWordScore = 0;
    for (const field of fields) {
      if (field.text.includes(word)) {
        bestWordScore = Math.max(bestWordScore, field.weight);
      } else {
        // Fuzzy check for each word in the target field
        const targetWords = field.text.split(/\s+/);
        for (const tw of targetWords) {
          const distance = getEditDistance(word, tw);
          const maxAllowed = word.length <= 4 ? 1 : 2;
          if (distance <= maxAllowed) {
            // Score decreases with distance
            const similarity = 1 - (distance / Math.max(word.length, tw.length));
            bestWordScore = Math.max(bestWordScore, similarity * field.weight * 0.8);
          }
        }
      }
    }
    totalScore += bestWordScore;
  }

  return totalScore / words.length;
};
