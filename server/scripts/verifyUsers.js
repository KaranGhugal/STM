const { connect, disconnect } = require('mongoose');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const { RoleType } = require('../models/roleModel');

const verifyUsers = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).select('+password');
    const roles = await Role.find({});

    console.log(`Total Users: ${users.length}, Total Roles: ${roles.length}`);

    // Check for users without corresponding roles
    for (const user of users) {
      const role = roles.find(r => r.email === user.email);
      if (!role) {
        console.warn(`⚠️ User ${user.email} has no corresponding Role entry. Creating one...`);
        await Role.create({
          name: user.name,
          email: user.email,
          password: user.password, // Use the same password (already hashed)
          confirmPassword: undefined, // Will be cleared by pre-save hook
          role: RoleType.USER // Default role
        });
        console.log(`✅ Created Role entry for ${user.email}`);
      }
    }

    // Check for roles without corresponding users (optional cleanup)
    for (const role of roles) {
      const user = users.find(u => u.email === role.email);
      if (!user) {
        console.warn(`⚠️ Role ${role.email} has no corresponding User entry. Consider deleting...`);
        // Optionally delete: await Role.deleteOne({ _id: role._id });
      }
    }

  } catch (err) {
    console.error('❌ Error verifying users:', err.message);
  } finally {
    await disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

module.exports = { verifyUsers };

// Run the script
verifyUsers();