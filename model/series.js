import mongoose from "mongoose";

const SeriesSchema = mongoose.Schema({
  title: { type: String, required: true },
  userChapterStatus: [{ userId: { type: String }, unlockedChapters: { type: Number } }],
  chapters: [
    {
      chapterNumber: { type: Number },
      title: { type: String },
      description: { type: String },
    },
  ],
});
const series = mongoose.model("series", SeriesSchema);
export default series;
