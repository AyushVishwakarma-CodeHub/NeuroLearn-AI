const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fixRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all users who don't have a role to 'user'
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );

    console.log(`Success! Updated ${result.modifiedCount} users to have the default 'user' role.`);
    
    // Also make sure your admin account is definitely 'admin'
    await User.updateOne(
      { email: 'ayushvishwakarmadto29@gmail.com' },
      { $set: { role: 'admin' } }
    );

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixRoles();
