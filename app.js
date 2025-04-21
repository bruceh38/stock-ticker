
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const uri = process.env.MONGODB_URI;
const mongoUri='mongodb://yanxiaohuang:3282306647Qwer@ac-bbl7oyz-shard-00-00.huyownj.mongodb.net:27017,ac-bbl7oyz-shard-00-01.huyownj.mongodb.net:27017,ac-bbl7oyz-shard-00-02.huyownj.mongodb.net:27017/?replicaSet=atlas-jqg13k-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=ClusterBruce';
const client = new MongoClient(uri);
const dbName = 'Stock';
const collectionName = 'PublicCompanies';
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
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

    res.render("result", { companies: results });
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    res.status(500).send('Server Error');
  }
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});