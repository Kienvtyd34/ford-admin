import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import Inventory from "../src/models/Inventory.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";
import { embedText } from "./embedding.js";

export const buildBrain = async () => {
  const brain = [];

  const vehicles = await VehicleModel.find();
  const variants = await Variant.find();
  const inventory = await Inventory.find();
  const problems = await CarProblem.find();
  const news = await News.find();

  for (const v of vehicles) {
    const vector = await embedText(`${v.name} ${v.type} ${v.seats} chỗ ${v.description}`);

    brain.push({
      type: "vehicle",
      text: v.name,
      vector,
      payload: v,
    });
  }

  for (const p of problems) {
    const vector = await embedText(`${p.title} ${p.symptoms.join(" ")} ${p.causes.join(" ")}`);

    brain.push({
      type: "problem",
      text: p.title,
      vector,
      payload: p,
    });
  }

  for (const n of news) {
    const vector = await embedText(`${n.title} ${n.summary}`);

    brain.push({
      type: "news",
      text: n.title,
      vector,
      payload: n,
    });
  }

  for (const i of inventory) {
    const vector = await embedText(`${i.vin} ${i.status} ${i.category}`);

    brain.push({
      type: "inventory",
      text: i.vin,
      vector,
      payload: i,
    });
  }

  return brain;
};