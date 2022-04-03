import express from "express";
import mongoose from "mongoose";
import Path from "path";
import axios from "axios";
import SeriesModel from "../model/series.js";
import fs from "fs";
const __dirname = Path.resolve();
export const uploadSeries = async (req, res) => {
  try {
    // console.log("post");
    const { title } = req.body;
    if (req.file) {
      // Read users.json file
      var chapters = [];
      let { data } = await axios.get("getAllUsers");
      // console.log(data.result);
      let users = [];
      data.result.map((res) => {
        users.push({ userId: res._id, unlockedChapters: 4 });
      });
      // Converting to JSON
      const filePath = Path.join(__dirname, `./uploads/${req.file.filename}`);
      chapters = await JSON.parse(fs.readFileSync(filePath));
      fs.unlink(filePath);
      // console.log("chapters");
      // });
      // console.log(chapters); // Print users
      let series = await SeriesModel.create({
        title: title,
        chapters: chapters,
        userChapterStatus: users,
      });
      if (series) {
        // console.log(series);
        return res.status(200).json({
          success: true,
          result: "file uploaded successfully",
          series: series,
        });
      } else {
        return res.json({
          success: false,
          result: "error occured while uploading please try again.",
        });
      }
    } else {
      return res.json({
        success: false,
        result: "No file found! Please select a file to upload",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      result: error,
    });
  }
};
export const fetchSeriesByUser = async (req, res) => {
  try {
    let data = await SeriesModel.find({});
    let chapters = [];
    // console.log(data);
    data.map((res) => {
      let user = res.userChapterStatus.filter((e) => {
        return e.userId == req.body.userId;
      });
      // console.log(user);
      let chap = [];
      for (
        let j = 0;
        j < Math.min(user[0].unlockedChapters, res.chapters.length);
        j++
      ) {
        chap.push(res.chapters[j]);
      }
      chapters.push({
        seriesTitle: res.title,
        totalChapters: res.chapters.length,
        unlockedChapters: user[0].unlockedChapters,
        chapters: chap,
      });
    });
    // console.log(chapters);
    return res.json({
      success: true,
      series: chapters,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      result: error,
    });
  }
};
export const fetchAllSeries = async (req, res) => {
  try {
    let series = await SeriesModel.find({});
    if (series) {
      return res.json({
        success: true,
        result: series,
      });
    } else {
      return res.json({
        success: false,
        result: "Error Occured!! Please try again",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      result: error,
    });
  }
};
export const updateUserInSeries = async (req, res) => {
  try {
    let series = await SeriesModel.updateMany({
      $push: {
        userChapterStatus: { userId: req.body.userId, unlockedChapters: 4 },
      },
    });
    if (series) {
      return res.json({
        success: true,
        result: "Updated successfully",
      });
    } else {
      return res.json({
        success: false,
        result: "Error Occured!! Please try again",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      result: error,
    });
  }
};

export const updateUnlockedChapters = async (req, res) => {
  try {
    // console.log(req.body);
    let series = await SeriesModel.findById(req.body.seriesId);
    // console.log(series);
    let totalChapters = series.chapters.length;
    let user = series.userChapterStatus.filter((e) => {
      return e.userId == req.body.userId;
    });
    let alreadyUnlocked = user[0].unlockedChapters;
    if (alreadyUnlocked < totalChapters) {
      let update = await SeriesModel.findOneAndUpdate(
        {
          id: req.body.seriesId,
          userChapterStatus: { $elemMatch: { userId: req.body.userId } },
        },
        { $inc: { "userChapterStatus.$.unlockedChapters": 1 } }
      );
      // console.log(update);
      return res.json({
        success: true,
        result: "Updated successfully",
      });
    } else {
      return res.json({
        success: true,
        result: "All chapters are already unlocked",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      result: error,
    });
  }
};
