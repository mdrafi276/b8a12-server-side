const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId,  } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5000;

require("dotenv").config();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6eaz3fu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("compannyDB").collection("userCollection");
    const riviewCollection = client.db("compannyDB").collection("riviewCollection");

// jwt 
app.post("/jwt", async (req, res) => {
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    
    expiresIn: "1h",
  });console.log(token);
  res.send({ token });
});


// user data api 

     app.post("/users", async (req, res) => {
       const query = req.body;
       console.log(query);
       const result = await userCollection.insertOne(query)
       res.send(result);
     });


      app.get("/users", async (req, res) => {
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
// delete user 
    
    //   riview data 
    
      app.get("/riview", async (req, res) => {
        const cursor = riviewCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("Employee manegnent  is running and Rafi vai is happy...........................");
});
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
