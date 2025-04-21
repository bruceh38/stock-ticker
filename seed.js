//import node.js module to handle file system operations
const fs = require('fs');
//import readline module to read the csv file
const readline = require('readline');
//import the mongo client from mongodb node.js driver
const { MongoClient } = require('mongodb');
//mongodb connection uri
const uri = 'mongodb://yanxiaohuang:3282306647Qwer@ac-bbl7oyz-shard-00-00.huyownj.mongodb.net:27017,ac-bbl7oyz-shard-00-01.huyownj.mongodb.net:27017,ac-bbl7oyz-shard-00-02.huyownj.mongodb.net:27017/?replicaSet=atlas-jqg13k-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=ClusterBruce';
//specify database and collection names
const dbName = 'Stock';
const collectionName = 'PublicCompanies';
//file path of the csv file
const filePath = 'companies.csv';
//main function to run import
async function run(){
    const client = new MongoClient(uri);
    try{
        //connect to mongo db
        await client.connect();
        console.log('Connected to MongoDB');
        //select the database and connection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        //set up line reader for the csv file
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });
        //read and process each line of the file
        for await (const line of rl){
            //split the csv line into three components
            const [name, ticker, priceStr] = line.split(',').map(item => item.trim());
            //skip any line that is missing data or has invalid price
            if (!name || !ticker || isNaN(priceStr)){
                console.warn('Skipping invalid line:', line);
                continue;
            }

            const price = parseFloat(priceStr);
            const doc = {name, ticker, latest_price: price};
            console.log('inserting: ', doc);
            await collection.insertOne(doc);

        }
        console.log('all data inserted');
    }
    catch (err){
        console.error('error: ', err);
    }
    //close the mongodb connection
    finally{
        await client.close();
    }
}
//call the function
run();