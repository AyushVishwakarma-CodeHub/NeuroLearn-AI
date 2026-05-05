const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const email = 'ayushvishwakarmadto29@gmail.com';
const newPassword = 'NeuroAyusH';

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        role: 'admin',
        password: hashedPassword 
      },
      { new: true }
    );

    if (user) {
      console.log(`Success! User ${email} is now an Admin with the updated password.`);
    } else {
      console.log(`User ${email} not found. Please make sure you have registered first!`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

setAdmin();
