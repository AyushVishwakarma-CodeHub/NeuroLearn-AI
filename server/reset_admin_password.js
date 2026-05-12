const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'ayushvishwakarmadto29@gmail.com';
    const newPassword = 'Admin@123'; // <--- Your new temporary password
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user
    const result = await User.updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin' 
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log(`Success! Password for ${email} has been reset to: ${newPassword}`);
      console.log('You are now an Admin. Please log in with these credentials.');
    } else {
      console.log(`Error: User with email ${email} not found. Please sign up first.`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetAdmin();
