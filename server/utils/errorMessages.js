
module.exports = {
    // Authentication Errors
    //User Controller Errors
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match, please try again',
    USER_EXISTS: 'User already exists',
    INVALID_CREDENTIALS: 'Invalid credentials format',
    AUTH_FAILED: 'Authentication failed',
    USER_NOT_FOUND_EMAIL: 'User not found with this email ID please try again',
    EMAIL_IN_USE: 'Email already in use',
    PASSWORD_REQUIRED: 'Current password is required',
    INCORRECT_PASSWORD: 'Entered password is incorrect, try again',
    INCORRECT_EMAIL_PASSWORD: 'Incorrect email or password',
    ACCOUNT_DELETED: 'User account deleted successfully',
  
    // Server Errors  
    DB_UNAVAILABLE: 'Database service unavailable',
    JWT_MISSING: 'JWT_SECRET is not configured',
    FILE_UPLOAD_ERROR: 'File upload error',
    SERVER_ERROR: 'Internal Server Error',
    INVALID_FILE_TYPE: 'Only image files are allowed!',

    // User Model
    NAME_REQUIRED: 'Name is required',
    EMAIL_REQUIRED: 'Email is required',
    INVALID_EMAIL: 'Invalid email format',
    PHONE_REQUIRED: 'Phone number is required',
    INVALID_PHONE: 'Invalid phone number format',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_LENGTH: 'Password must be at least 8 characters',
    HASHING_ERROR: 'Password hashing failed',

    // Task Controller Errors
    TASK_NOT_FOUND: "Task not found",
    UNAUTHORIZED_TASK_ACCESS: "Unauthorized access to task",
    UNAUTHORIZED_TASK_MODIFY: "Unauthorized to modify this task",
    UNAUTHORIZED_TASK_DELETE: "Unauthorized to delete this task",
    UNAUTHORIZED_STATUS_UPDATE: "Unauthorized to update this task's status",
    STATUS_REQUIRED: "Status is required",
    INVALID_STATUS: "Invalid status. Must be one of: pending, in-progress, completed",
    USER_NOT_FOUND: "User not found",
    TASK_ALREADY_SHARED: "Task already shared with this user",

    // Success Messages (Optional)
    TASK_CREATED: "Task created successfully",
    TASK_UPDATED: "Task updated successfully",
    STATUS_UPDATED: "Task status updated successfully",
    TASK_DELETED: "Task permanently deleted",
    TASK_SHARED: "Task shared successfully",
    TASK_UNSHARED: "Task unshared successfully",

    // Task Model
    TITLE_REQUIRED: 'Title is required',
    TITLE_MAX_LENGTH: 'Title cannot exceed 100 characters',
    DESCRIPTION_MAX_LENGTH: 'Description cannot exceed 500 characters',
    CATEGORY_REQUIRED: 'Category is required',
    PRIORITY_REQUIRED: 'Priority is required',
    STATUS_REQUIRED: 'Status is required',
    DUE_DATE_REQUIRED: 'Due date is required',
    SELF_SHARE_ERROR: 'Cannot share task with yourself',

    // Enums
    TASK_CATEGORIES: ["Work", "Personal", "Study", "Health", "Other"],
    TASK_PRIORITIES: ['high', 'medium', 'low'],
    TASK_STATUSES: ['pending', 'in-progress', 'completed'],


};