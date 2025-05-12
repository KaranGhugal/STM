// server/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Constants for validation
const CATEGORIES = ["Work", "Personal", "Study", "Health", "Other"];
const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['pending', 'in-progress', 'completed'];

// Global authentication
router.use(auth);

// Shared validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation chains
const createTaskValidations = [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(CATEGORIES).withMessage(`Valid categories: ${CATEGORIES.join(', ')}`),
  body('priority').isIn(PRIORITIES).withMessage(`Valid priorities: ${PRIORITIES.join(', ')}`),
  body('dueDate').isISO8601().withMessage('Valid ISO8601 date required'),
  body('status').optional().isIn(STATUSES),
  body('sharedWith').optional().isMongoId().withMessage('Valid user ID required'),
  validate
];

const updateTaskValidations  = [
  body('title').optional().notEmpty(),
  body('category').optional().isIn(CATEGORIES),
  body('priority').optional().isIn(PRIORITIES),
  body('status').optional().isIn(STATUSES),
  body('dueDate').optional().isISO8601(),
  body('description').optional().isLength({ max: 500 }),
  body('sharedWith').optional().isMongoId(),
  validate
];

// Task collection routes
router.route('/')
  .get(taskController.getAllTasks)
  .post(createTaskValidations, taskController.createTask);

// Individual task routes
router.route('/:id')
  .get(taskController.getTaskById)
  .put(updateTaskValidations , taskController.updateTask)
  .delete(taskController.deleteTask);

// Special operations
router.patch('/:id/status',
  body('status').isIn(STATUSES).withMessage('Valid status required'),
  validate,
  taskController.updateTaskStatus
);

router.patch('/:id/share',
  body('sharedWith').isMongoId().withMessage('Valid user ID required'),
  validate,
  taskController.shareTask
);

// Category filtering
router.get('/category/:category', 
  (req, res, next) => CATEGORIES.includes(req.params.category) 
    ? next() 
    : res.status(400).json({ error: 'Invalid category' }),
  taskController.getTasksByCategory
);

module.exports = router;