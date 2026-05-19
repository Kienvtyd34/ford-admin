const stopwords = ["là", "xe", "có", "bao", "nhiêu", "tôi", "muốn", "không"];

export const vectorize = (text) => {
  const words = text.toLowerCase().split(" ");

  const vec = {};

  for (let w of words) {
    if (!stopwords.includes(w)) {
      vec[w] = (vec[w] || 0) + 1;
    }
  }

  return vec;
};

export const cosineSimilarity = (a, b) => {
  let dot = 0, magA = 0, magB = 0;

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (let k of keys) {
    const x = a[k] || 0;
    const y = b[k] || 0;

    dot += x * y;
    magA += x * x;
    magB += y * y;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
};