import faiss from "faiss-node";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();

export const DIM = 100;

export const index = new faiss.IndexFlatL2(DIM);
export const idMap = [];

// =====================
// HASH
// =====================
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
};

// =====================
// NORMALIZE
// =====================
const normalize = (vec) => {
  const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
  return vec.map(v => v / norm);
};

// =====================
// TEXT → VECTOR
// =====================
export const textToVector = (text = "") => {
  const words = tokenizer.tokenize(text.toLowerCase());

  const vec = new Array(DIM).fill(0);

  words.forEach((w) => {
    const idx = Math.abs(hash(w)) % DIM;
    vec[idx] += 1;
  });

  return normalize(vec);
};

// =====================
// ADD VECTOR
// =====================
export const addToIndex = (text, data) => {
  const vec = Float32Array.from(textToVector(text));

  index.add(vec);
  idMap.push(data);
};