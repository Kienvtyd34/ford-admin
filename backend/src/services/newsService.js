import News from "../models/News.js";

export const getLatestNews = async () => {
  return await News.findOne().sort({ createdAt: -1 });
};