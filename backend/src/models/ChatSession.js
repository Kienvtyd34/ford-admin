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
   minBudget: Number,
   maxBudget: Number,
   seats: Number,
   usage: String, // family business transport
   drivingArea: String, // city highway mixed offroad
   fuelPreference: String, // gasoline diesel electric
   wantsADAS: Boolean,
   wantsLuxury: Boolean,
   wantsOffroad: Boolean,
   cargoNeed: Boolean,
   ecoFriendly: Boolean,
   familyMembers: Number,
   frequentTravel: Boolean,
   consultationStep: Number
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

