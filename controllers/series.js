import express from "express";
import mongoose from "mongoose";
import Path from "path";
import axios from "axios";
import SeriesModel from "../model/series.js";
import fs from "fs";
const __dirname = Path.resolve();
export const uploadSeries = async (req, res) => {
  try {
    const { title } = req.body;
    
    //File is required
    if (req.file) {
      var chapters = [];

      //getting users data
      let { data } = await axios.get("getAllUsers");
      let users = [];
      data.result.map((res) => {
        users.push({ userId: res._id, unlockedChapters: 4 });
      });

      //Read users.json file and Converting to JSON
      const filePath = Path.join(__dirname, `./uploads/${req.file.filename}`);
      chapters = await JSON.parse(fs.readFileSync(filePath));

      //deleting file as i have the data in chapters
      fs.unlink(filePath, (error) => {
        if (error) {
          console.log(error);
          return res.json({ success: false, result: "Error" });
        }
      });

      //creating series with all chapters and users data
      let series = await SeriesModel.create({
        title: title,
        chapters: chapters,
        userChapterStatus: users,
      });
      if (series) {
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

    //all series data
    let data = await SeriesModel.find({});
    let chapters = [];
    
    data.map((res) => {

      //data of unlockedChapters in each series for given user
      let user = res.userChapterStatus.filter((e) => {
        return e.userId == req.body.userId;
      });

      let chap = [];

      //pushing all unlocked chapters data in chap
      for (let j = 0;j < user[0].unlockedChapters;j++) {
        chap.push(res.chapters[j]);
      }
      chapters.push({
        seriesTitle: res.title,
        totalChapters: res.chapters.length,
        unlockedChapters: user[0].unlockedChapters,
        chapters: chap,
      });
    });
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
    //fetching all series data 
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
    //when a new user is created then adding the unlockedChapters and userdId to each series
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
    console.log(error);
    return res.json({
      success: false,
      result: error,
    });
  }
};

export const updateUnlockedChapters = async (req, res) => {
  try {
    
    //incrementing the value of unlocked chapter of particular series for a particular user
    let series = await SeriesModel.findById(req.body.seriesId);
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
      if(update)
      return res.json({
        success: true,
        result: "Updated successfully",
      });
      else{
        return res.status(404).json({
          success:false,
          result:"Error Occurred!! Please try again."
        })
      }
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
