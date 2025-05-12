const Task = require("../models/taskModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { sendEmailNotification } = require("../services/notificationService");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    deadline: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    status: "pending",
    createdBy: req.user._id,
  }).select("title deadline");

  res.json(tasks);
});

// @desc    Schedule reminders
// @route   POST /api/notifications/schedule
// @access  Private
const scheduleReminders = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    deadline: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    status: "pending",
    createdBy: req.user._id,
  }).populate("createdBy", "email");

  tasks.forEach((task) => {
    sendEmailNotification({
      email: task.createdBy.email,
      subject: "Task Deadline Reminder",
      text: `Your task "${task.title}" is due on ${task.deadline}`,
    });
  });

  res.json({ message: "Reminders scheduled successfully" });
});

module.exports = {
  getNotifications,
  scheduleReminders,
};
