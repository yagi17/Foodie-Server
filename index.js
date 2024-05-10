require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
      origin: [
        "http://localhost:5000",
      ],
      credentials: true,
    })
  );
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.5bvaa0x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const dbConnect = async () => {
    try {
        console.log("You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error.massage);
    }
};
dbConnect();

const menuCollection = client.db("FoodieDB").collection("menu")

app.post('/allmenu', async(res, req)=>{
    const newsItem = req.body
    const result = await menuCollection.insertOne(newsItem)
    res.send(result)
})

app.get('/allmenu', async(req, res) =>{
    const menu = menuCollection.find()
    const result = await menu.toArray()
    res.send(result)
})

app.get('/', async (req, res)=>{
    res.send('Food is cooking')
})

app.listen(port, () => {
    console.log(`Food is cooking on port: ${port}`);
});