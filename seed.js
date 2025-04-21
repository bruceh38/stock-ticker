const fs = require('fs');
const readline = require('readline');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://yanxiaohuang:3282306647Qwer@ac-bbl7oyz-shard-00-00.huyownj.mongodb.net:27017,ac-bbl7oyz-shard-00-01.huyownj.mongodb.net:27017,ac-bbl7oyz-shard-00-02.huyownj.mongodb.net:27017/?replicaSet=atlas-jqg13k-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=ClusterBruce';
const dbName = 'Stock';
const collectionName = 'PublicCompanies';
const filePath = 'companies.csv';

async function run(){
    const client = new MongoClient(uri);
    try{
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });

        for await (const line of rl){
            const [name, ticker, priceStr] = line.split(',').map(item => item.trim());
            if (!name || !ticker || isNaN(priceStr)){
                console.warn('Skipping invalid line:', line);
                continue;
            }

            const price = parseFloat(priceStr);
            const doc = {name, ticker, latest_price: price};
            console.log('Inserting: ', doc);
            await collection.insertOne(doc);

        }
        console.log('All data inserted.');

    }
    catch (err){
        console.error('Error: ', err);
    }
    finally{
        await client.close();
    }
}

run();