const Task = require("../models/taskModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const {
  TASK_NOT_FOUND,
  UNAUTHORIZED_TASK_ACCESS,
  UNAUTHORIZED_TASK_MODIFY,
  UNAUTHORIZED_TASK_DELETE,
  UNAUTHORIZED_STATUS_UPDATE,
  STATUS_REQUIRED,
  INVALID_STATUS,
  USER_NOT_FOUND,
  TASK_ALREADY_SHARED,
  TASK_CREATED,
  TASK_UPDATED,
  STATUS_UPDATED,
  TASK_DELETED,
  TASK_SHARED
} = require("../utils/errorMessages");

// Helper: Populate task data
const populateTask = query => query
  .populate("userId", "name email")
  .populate("sharedWith", "name email");

// Helper: Verify task permissions
const verifyTaskAccess = (task, user) => {
  const isOwner = task.userId._id.equals(user._id);
  const isShared = task.sharedWith?.some(u => u._id.equals(user._id));
  return isOwner || isShared;
};

// @desc    Get all tasks for user
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await populateTask(
    Task.find({
      $or: [{ userId: req.user._id }, { sharedWith: req.user._id }]
    }).sort("-createdAt")
  ).lean();

  res.json({ count: tasks.length, tasks });
});

// @desc    Get single task by ID
const getTaskById = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.id)).lean();
  
  if (!task) throw new Error(TASK_NOT_FOUND);
  if (!verifyTaskAccess(task, req.user)) throw new Error(UNAUTHORIZED_TASK_ACCESS);

  res.json(task);
});

// @desc    Create new task
const createTask = asyncHandler(async (req, res) => {
  const newTask = await Task.create({
    ...req.body,
    userId: req.user._id,
    sharedWith: req.body.sharedWith || []
  });

  const populatedTask = await populateTask(Task.findById(newTask._id));
  res.status(201).json({ message: TASK_CREATED, task: populatedTask });
});

// @desc    Update task
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new Error(TASK_NOT_FOUND);
  if (!task.userId.equals(req.user._id)) throw new Error(UNAUTHORIZED_TASK_MODIFY);

  const { userId, ...updates } = req.body;
  Object.entries(updates).forEach(([key, value]) => task[key] = value);
  
  await task.save();
  const updatedTask = await populateTask(Task.findById(req.params.id));
  res.json({ message: TASK_UPDATED, task: updatedTask });
});

// @desc    Update task status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'in-progress', 'completed'];
  
  if (!status) throw new Error(STATUS_REQUIRED);
  if (!validStatuses.includes(status)) throw new Error(INVALID_STATUS);

  const task = await Task.findById(req.params.id);
  if (!task) throw new Error(TASK_NOT_FOUND);
  if (!verifyTaskAccess(task, req.user)) throw new Error(UNAUTHORIZED_STATUS_UPDATE);

  task.status = status;
  await task.save();

  const updatedTask = await populateTask(Task.findById(req.params.id));
  res.json({ message: STATUS_UPDATED, task: updatedTask });
});

// @desc    Delete task
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new Error(TASK_NOT_FOUND);
  if (!task.userId.equals(req.user._id)) throw new Error(UNAUTHORIZED_TASK_DELETE);

  await task.deleteOne();
  res.json({ message: TASK_DELETED, id: req.params.id });
});

// @desc    Share task with user
const shareTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  const { sharedWith: userId } = req.body;

  if (!task) throw new Error(TASK_NOT_FOUND);
  if (!task.userId.equals(req.user._id)) throw new Error(UNAUTHORIZED_TASK_MODIFY);

  const user = await User.findById(userId).select("_id name email");
  if (!user) throw new Error(USER_NOT_FOUND);
  if (task.sharedWith.some(id => id.equals(user._id))) throw new Error(TASK_ALREADY_SHARED);

  task.sharedWith.push(user._id);
  await task.save();
  const populatedTask = await populateTask(Task.findById(req.params.id));
  res.json({ message: TASK_SHARED, sharedWith: user, shareCount: task.sharedWith.length, task: populatedTask });
});

// @desc    Get tasks by category
const getTasksByCategory = asyncHandler(async (req, res) => {
  const tasks = await populateTask(
    Task.find({
      category: req.params.category,
      $or: [{ userId: req.user._id }, { sharedWith: req.user._id }]
    }).sort("dueDate")
  ).lean();

  res.json({ category: req.params.category, count: tasks.length, tasks });
});

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  shareTask,
  getTasksByCategory,
  updateTaskStatus
};