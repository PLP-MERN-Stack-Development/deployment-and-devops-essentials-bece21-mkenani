require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 Testing MongoDB Connection...\n');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('Connection string:', MONGODB_URI.replace(/:(.*)@/, ':****@'));
console.log('');

// Set mongoose debug to see what's happening
mongoose.set('debug', true);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(async () => {
  console.log('✅ SUCCESS: Connected to MongoDB!');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Host:', mongoose.connection.host);
  
  // Test if we can create a todo
  const Todo = mongoose.model('Todo', new mongoose.Schema({
    title: String,
    completed: Boolean,
    createdAt: Date
  }));
  
  const testTodo = new Todo({ title: 'Test connection todo' });
  await testTodo.save();
  console.log('✅ Database write test: PASSED');
  
  await mongoose.connection.close();
  console.log('✅ Connection closed');
  process.exit(0);
})
.catch((error) => {
  console.log('❌ FAILED: Could not connect to MongoDB');
  console.log('Error name:', error.name);
  console.log('Error message:', error.message);
  console.log('\n🔧 What to check:');
  console.log('1. Go to MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0');
  console.log('2. Check your username/password in the connection string');
  console.log('3. Make sure your cluster is running');
  process.exit(1);
});