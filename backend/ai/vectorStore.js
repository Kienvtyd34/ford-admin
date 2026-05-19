import faiss from "faiss-node";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

// Vector dimension cố định
const DIM = 100;

// FAISS index (cosine-like via normalized vectors)
export const index = new faiss.IndexFlatL2(DIM);

// map id → data
export const idMap = [];

// normalize vector
export const normalize = (vec) => {
  let norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
  return vec.map(v => v / norm);
};

// text → vector (TF-IDF simplified)
export const textToVector = (text) => {
  const words = tokenizer.tokenize(text.toLowerCase());

  const vec = new Array(DIM).fill(0);

  words.forEach((w, i) => {
    const idx = Math.abs(hash(w)) % DIM;
    vec[idx] += 1;
  });

  return normalize(vec);
};

// hash function
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
};

// add document
export const addToIndex = (text, data) => {
  const vec = textToVector(text);
  const floatVec = Float32Array.from(vec);

  index.add(floatVec);
  idMap.push(data);
};

// search
export const search = (query, k = 5) => {
  const vec = Float32Array.from(textToVector(query));

  const result = index.search(vec, k);

  return result.labels
    .filter(i => i !== -1)
    .map(i => idMap[i]);
};