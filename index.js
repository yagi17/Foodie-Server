require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
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


// data Collections
const menuCollection = client.db("FoodieDB").collection("menu")
const userCollection = client.db('FoodieDB').collection('user')

app.post('/allMenu', async (req, res) => {
    const newsItem = req.body
    const result = await menuCollection.insertOne(newsItem)
    res.send(result)
})

app.get('/allMenu', async (req, res) => {
    const menu = menuCollection.find()
    const result = await menu.toArray()
    res.send(result)
})

// user data collection
app.post('/users', async (req, res) => {
    const newsUser = req.body
    const result = await userCollection.insertOne(newsUser)
    res.send(result)
})

app.get('/users', async (req, res) => {
    const user = userCollection.find()
    const result = await user.toArray()
    res.send(result)
})

// get items by point person email
app.get('/allMenu/list/:email', async (req, res) => {
    const email = req.params.email
    const query = { pointPersonEmail: email }
    const result = await menuCollection.find(query).toArray()
    res.send(result)
})

// get item by id
// get item by id
app.get('/allMenu/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await userCollection.find(query).toArray();
    res.send(result);
});



app.get('/', async (req, res) => {
    res.send('Food is cooking')
})

app.listen(port, () => {
    console.log(`Food is cooking on port: ${port}`);
});