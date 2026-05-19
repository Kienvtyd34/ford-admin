import natural from "natural";

const tokenizer = new natural.WordTokenizer();

export const search = (query, k = 5) => {
  const queryVec = Float32Array.from(textToVector(query));

  const result = index.search(queryVec, k);

  return result.labels
    .map((i, idx) => {
      if (i === -1) return null;

      return {
        ...idMap[i],
        score: result.distances[idx] // càng nhỏ càng giống
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);
};