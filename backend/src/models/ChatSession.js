import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
{
   sessionId: {
      type: String,
      required: true,
      unique: true
   },

   modelName: String,
   variantName: String,
   color: String,
   compareModels: {
   type: [String],
   default: []
    },
   lastIntent: String,
   recommendedVariants: {
    type: [String],
    default: []
},
customerProfile: {
   budget: Number,
   seats: Number,
   usage: String,
   drivingArea: String,
   fuelPreference: String,
   wantsADAS: Boolean,
   wantsLuxury: Boolean,
   wantsOffroad: Boolean
},

chatHistory: [{
   role: String,
   content: String,
   createdAt: {
      type: Date,
      default: Date.now
   }
}]
},

{
   timestamps: true
}
);

chatSessionSchema.index(
{
    updatedAt: 1
},
{
    expireAfterSeconds: 86400
}
);

export default mongoose.model(
   "ChatSession",
   chatSessionSchema
);

