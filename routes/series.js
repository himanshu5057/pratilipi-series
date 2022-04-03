import express from "express";
import mongoose from "mongoose";
const router = express.Router();
import Path from "path";
import multer from "multer";
const __dirname = Path.resolve();
import { fetchAllSeries, fetchSeriesByUser, updateUnlockedChapters, updateUserInSeries, uploadSeries } from "../controllers/series.js";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, Path.join(__dirname, "./uploads"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + Path.extname(file.originalname)
    );
  },
});
var upload = multer({
  storage: storage,
  //   limits: {
  // fileSize: 5 * 1024 * 1024,
  //   },
});

router.post("/uploadSeries", upload.single("file"), uploadSeries);
router.post("/fetchSeriesByUser",fetchSeriesByUser);
router.get("/fetchAllSeries",fetchAllSeries);
router.post("/updateUserInSeries",updateUserInSeries);
router.post("/updateUnlockedChapters",updateUnlockedChapters);
export default router;