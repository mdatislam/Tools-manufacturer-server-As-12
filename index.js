const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { options } = require("nodemon/lib/config");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// pass: 4WhHhG9T04N5ruvo
// user: admin

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.biwft.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyjwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: " Unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "access forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("Tools-manufacturer")
      .collection("products");
    const orderCollection = client.db("Tools-manufacturer").collection("order");
    const usersCollection = client.db("Tools-manufacturer").collection("user");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      //   console.log('from mongo db')
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(filter);
      // console.log(result)
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const updateStock = req.body;
      // console.log(updateStock)
      const options = { upsert: true };
      const updateDoc = {
        $set: { stock: updateStock.newStock },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const data = req.body;
      // console.log(data)
      const result = await orderCollection.insertOne(data);
      return res.send({ success: true, result });
    });

    //To profile update

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      return res.send({ result, token });
    });

    app.get("/order/:email", verifyjwt, async (req, res) => {
      const email = req.params.email;
      const requesterEmail = req.decoded.email
      if (email === requesterEmail) {
        const filter = { customerEmail: email };
        const result = await orderCollection.find(filter).toArray();
        res.send(result);
      } else {
        return res.status(403).send({ message: "Forbidden access" });
      }
    });

    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });

    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(filter);
      return res.send({ success: true, result });
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello ToolKits-manufacturer!");
});

app.listen(port, () => {
  console.log(`Tools Manufacturer app listening on port ${port}`);
});
