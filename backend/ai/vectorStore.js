import natural from "natural";

const tokenizer = new natural.WordTokenizer();

export const search = (query, k = 5) => {
  const words = tokenizer.tokenize(query.toLowerCase());

  if (!global.__vectorIndex || !global.__idMap) {
    return [];
  }

  const scores = global.__vectorIndex.map((doc, i) => {
    let score = 0;

    words.forEach(w => {
      if (doc.includes(w)) score += 1;
    });

    return { i, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(s => global.__idMap[s.i]);
};