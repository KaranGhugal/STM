// server/services/notificationService.js

const { createTransport } = require('nodemailer');
const { schedule } = require('node-cron');
const { Task } = require('../models/taskModel');

// Configure transporter for email
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Schedule a task: runs daily at 8 AM
schedule('0 8 * * *', async () => {
  try {
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const tasks = await Task.find({
      deadline: { $lte: deadline },
      status: 'pending',
    }).populate('createdBy');

    tasks.forEach((task) => {
      if (!task?.createdBy?.email) return;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: task.createdBy.email,
        subject: 'Task Deadline Reminder',
        html: `<p>Hi ${task.createdBy.name || ''},<br>Your task "<strong>${task.title}</strong>" is due soon! Please take necessary action.</p>`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`Error sending email to ${task.createdBy.email}:`, err);
        } else {
          console.log(`Reminder sent to ${task.createdBy.email}:`, info.response);
        }
      });
    });
  } catch (err) {
    console.error('Scheduled notification error:', err.message);
  }
});
