const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const User = require('./models/User');

async function checkStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'ayush@gmail.com' });
    
    if (user) {
      console.log('--- USER STATS FOR ayush@gmail.com ---');
      console.log('Stats Object:', user.stats);
      console.log('XP:', user.xp);
      console.log('Level:', user.level);
      console.log('Streak:', user.streak);
      console.log('--------------------------------------');
    } else {
      console.log('User ayush@gmail.com not found.');
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkStats();
