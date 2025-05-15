Smart Task Manager
 
Smart Task Manager is a full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to optimize task management with role-based access control for User, Admin, and Super Admin roles. It provides a modern, responsive interface for creating, editing, filtering, sharing, and tracking tasks, supported by a secure, scalable backend. Key features include real-time analytics, user profile management, customizable settings, and automated email notifications, enhancing productivity and collaboration.
Table of Contents

Features
Technologies
Installation
Usage
Folder Structure
Screenshots
Contributing
License
Contact

Features

Role-Based Access Control: Distinct permissions for User, Admin, and Super Admin roles.
Task Management: Create, edit, delete, and share tasks with advanced filtering by status, category, priority, and search.
Real-Time Analytics: Interactive dashboard displaying task statistics and progress tracking.
User Profiles: Update personal details, profile photos, and security settings.
Customizable Settings: Toggle dark/light mode, configure notifications, and adjust regional preferences (language, timezone).
Collaboration: Share tasks with team members and view shared users' avatars.
Automated Notifications: Email alerts for user onboarding, task updates, and verification using Nodemailer.
Security: JWT-based authentication, CORS, input validation, and robust error handling.
Responsive Design: Optimized for desktop and mobile using Material-UI and Tailwind CSS.

Technologies

Frontend: React, Material-UI, Tailwind CSS, Formik, Yup, Axios, React Router, date-fns, notistack, jwt-decode
Backend: Node.js, Express.js, MongoDB, Mongoose
Authentication: JSON Web Tokens (JWT)
Email: Nodemailer
Tools: Git, npm, ESLint, VS Code

Installation
Follow these steps to set up the project locally.
Prerequisites

Node.js (v16 or higher)
MongoDB (local or MongoDB Atlas)
Git

Steps

Clone the Repository
git clone https://github.com/KaranGhugal/smart-task-manager.git
cd smart-task-manager


Install Dependencies

For the backend:cd server
npm install


For the frontend:cd ../client
npm install




Configure Environment Variables

Backend: Create a .env file in the backend directory:PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-task-manager
JWT_SECRET=your_jwt_secret
NODE_ENV=development
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password


Frontend: Create a .env file in the frontend directory:REACT_APP_API_BASE_URL=http://localhost:5000




Run MongoDBEnsure MongoDB is running locally or provide a MongoDB Atlas URI in the backend .env file.

Start the Application

Backend:cd backend
npm start


Frontend:cd frontend
npm start



The backend runs on http://localhost:5000, and the frontend runs on http://localhost:3000.


Usage

Register/Login: Sign up or log in to access the dashboard.
Manage Tasks: Use the Tasks page to create, edit, filter, or share tasks.
View Analytics: Monitor task statistics and progress on the dashboard.
Admin Features: Admins can manage roles and users via the Roles page.
Customize Settings: Adjust theme, notifications, and regional preferences in Settings.
Profile Management: Update personal details and security settings in the Profile page.

Folder Structure
smart-task-manager/
├── backend/                    # Backend source code
│   ├── controllers/            # API request handlers
│   ├── middleware/             # Authentication and error middleware
│   ├── models/                 # Mongoose schemas (User, Task, Role)
│   ├── routes/                 # API routes (auth, tasks, users)
│   ├── utils/                  # Utilities (email, auth, error handling)
│   ├── .env                    # Backend environment variables
│   └── server.js               # Backend entry point
├── frontend/                   # Frontend source code
│   ├── src/
│   │   ├── components/         # Reusable components (TaskItem, TaskForm, TaskStats)
│   │   ├── contexts/           # Auth and theme contexts
│   │   ├── hooks/              # Custom hooks (useTasks, useTaskApi)
│   │   ├── Pages/              # Page components (Tasks, Profile, Login)
│   │   ├── utils/              # Frontend utilities
│   │   ├── App.js              # Main app component
│   │   └── index.js            # Frontend entry point
│   ├── .env                    # Frontend environment variables
│   └── package.json
├── README.md                   # Project documentation
└── LICENSE                     # License file

Screenshots


Dashboard:

Task List:

Profile Page:


Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request with a detailed description.

Please follow the Code of Conduct and run npm run lint before submitting.
License
This project is licensed under the MIT License.
Contact
For questions or feedback:

Email: karanghugal11@gmail.com


Built with 💻 and ☕ by Karan Ghugal
