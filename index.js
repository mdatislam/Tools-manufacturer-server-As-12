const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json());




// pass: 4WhHhG9T04N5ruvo
// user: admin





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.biwft.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
/* client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log('connect toolsKit')
  // perform actions on the collection object
  client.close();
}); */

async function run() {
    try {
      await client.connect();
      const productsCollection = client.db("Tools-manufacturer").collection("products");

      app.get('/products' , async(req,res)=>{
          const query = {}
          const cursor = productsCollection.find(query)
          const result = await cursor.toArray()
          console.log('from mongo db')
          res.send(result)
      })
     
      
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


  
app.get('/', (req, res) => {
    res.send('Hello ToolKits-manufacturer!')
  })
  
  app.listen(port, () => {
    console.log(`Tools Manufacturer app listening on port ${port}`)
  })
  