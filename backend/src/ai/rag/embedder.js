import crypto from "crypto";

export const embedder = async (text) => {
  const hash = crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");

  const vector = [];

  for (let i = 0; i < 64; i++) {
    const chunk = hash.slice(i * 4, i * 4 + 4);
    vector.push((parseInt(chunk, 16) % 1000) / 1000);
  }

  return vector;
};

export default embedder;