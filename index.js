require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://foodie-9960c.web.app',
        'https://foodie-9960c.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

// middlewares
const logger = (req, res, next) => {
    // console.log('log info', req.method, req.url);
    next()
}
// verify Token
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token
    // console.log(token);
    if (!token) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: "unauthorized access" })
        }
        req.user = decoded;
        next()
    })

}


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
const purchaseCollection = client.db('FoodieDB').collection('curt')
const galleryCollection = client.db('FoodieDB').collection('gallery')

// set cookies
app.post('/cookies', logger, async (req, res) => {
    const user = req.body
    console.log('user for token', user);
    const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' })
    // console.log(token);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
        .send({ success: true })
})

// clear cookie
app.post('/logout', logger, async (req, res) => {
    const user = req.body
    // console.log('logging out', user);
    res.clearCookie('token', {
        maxAge: 0, secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    }).send({ success: true })
})

// menu data collection
app.post('/allMenu', async (req, res) => {
    const newsItem = req.body
    const result = await menuCollection.insertOne(newsItem)
    res.send(result)
})

// get all menu item
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
app.get('/allMenu/list/:email', logger, verifyToken, async (req, res) => {
    const email = req.params.email
    console.log(email);
    console.log('token owner info:', req.user);
    if (req.user.email !== email) {
        return res.status(403).send({ message: 'forbidden access' })
    }
    const query = { pointPersonEmail: email }
    const result = await menuCollection.find(query).toArray()
    res.send(result)
})

// get item by id
app.get('/allMenu/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await menuCollection.find(query).toArray();
    res.send(result);
});

// delete item by id
app.delete('/allMenu/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await menuCollection.deleteOne(query);
    res.send(result);
})

// update item by id
app.patch('/allMenu/:id', async (req, res) => {
    const update = req.body;
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const updateFields = {};

    // Check which fields are present in the update object
    if (update.name) updateFields['name'] = update.name;
    if (update.image) updateFields['image'] = update.image;
    if (update.category) updateFields['category'] = update.category;
    if (update.quantity) updateFields['quantity'] = update.quantity;
    if (update.description) updateFields['description'] = update.description;
    if (update.price) updateFields['price'] = update.price;

    const newValue = { $set: updateFields };
    const result = await menuCollection.updateOne(query, newValue);
    res.send(result);
});

// Purchase data by email

app.post('/curt/:email', async (req, res) => {
    const email = req.params.email;
    const curtData = req.body;
    const result = await purchaseCollection.insertOne({ email, ...curtData });
    res.send(result);
});

// to get items by email
app.get('/curt/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const result = await purchaseCollection.find(query).toArray();
    res.send(result);
});

//To delete data from curt
app.delete('/curt/:email/:id', async (req, res) => {
    const email = req.params.email;
    const id = req.params.id;
    const query = { _id: new ObjectId(id), email: email };
    const result = await purchaseCollection.deleteOne(query);
    res.send(result);
});

// gallery
app.post('/gallery', async (req, res) => {
    const newsItem = req.body
    const result = await galleryCollection.insertOne(newsItem)
    res.send(result)
})

app.get('/gallery', async (req, res) => {
    const feedback = galleryCollection.find()
    const result = await feedback.toArray()
    res.send(result)
})

// (require("crypto").randomBytes(64).toString("hex")

app.get('/', async (req, res) => {
    res.send('Food is cooking')
})

app.listen(port, () => {
    console.log(`Food is cooking on port: ${port}`);
})