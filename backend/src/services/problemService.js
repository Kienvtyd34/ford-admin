import CarProblem from "../models/CarProblem.js";

export const getAll = async () => {
  return await CarProblem.find({});
};