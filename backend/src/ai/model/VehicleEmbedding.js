import mongoose from "mongoose";

const schema = new mongoose.Schema({
  text: String,
  vector: [Number],
  refId: String,
});

export default mongoose.model("VehicleEmbedding", schema);