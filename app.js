
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.static('public'));
//Use environment variable for MongoDB URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

//load db info
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

//use view engine and static folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

//set home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// process search query
app.get('/process', async (req, res) => {
  const query = req.query.query;
  const searchType = req.query.searchType;

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    let filter = {};
    if (searchType === 'ticker') {
      filter = { ticker: query.toUpperCase() };
    } else if (searchType === 'company') {
      filter = { name: { $regex: query, $options: 'i' } };
    }
    const results = await collection.find(filter).toArray();
    console.log('Search Results:', results);
    res.render('result', { companies: results });
  } 
  catch (err) {
    console.error('Error querying MongoDB:', err);
    res.status(500).send('Server Error');
  }
});

//use Heroku-assigned port or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});