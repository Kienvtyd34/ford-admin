import mongoose from "mongoose";

import CarProblem from "../models/CarProblem.js";

import { problems } from "./carProblems.js";

await mongoose.connect(
  "mongodb://127.0.0.1:27017/ford_database"
);

await CarProblem.deleteMany();

await CarProblem.insertMany(problems);

console.log("IMPORT SUCCESS");

process.exit();