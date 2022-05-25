const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
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

async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("Tools-manufacturer")
      .collection("products");

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

   app.put('/products/:id', async(req,res)=>{
      const filter = {_id:ObjectId(req.params.id)}
      const updateStock = req.body 
      console.log(updateStock)
      const options= {upsert:true}
      const updateDoc ={
        $set:{ stock:updateStock.newStock },
      }
      const result= await productsCollection.updateOne(filter,updateDoc, options)
      res.send(result)
    }) 

    
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
