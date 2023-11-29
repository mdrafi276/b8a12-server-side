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
// app.use(
//   cors({
//     origin: ["http://localhost:5173"],
//     credentials: true,
//   })
// );


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
    const riviewCollection = client
      .db("compannyDB")
      .collection("riviewCollection");
    const contactCollection = client
      .db("compannyDB")
      .collection("contactCollection");

   

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10d",
      });
      res.send(token);
    });

    // middlewares
    const verifyToken = (req, res, next) => {
      console.log("inside verify token", req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization;
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // user data api

    app.post("/users",  async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist ", insertedId: null });
      }
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });



    app.get("/users/admin/:email",  async (req, res) => {
      const email = req.params.email;
      // if (email !== req.decoded.email) {
      //   // return res.status(403).send({ message: "forbidden access" });
      // }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
      admin = user?.selectedRole === "admin";
      }
      res.send({ admin });
    });
    app.get("/users/HR/:email",  async (req, res) => {
      const email = req.params.email;
      // if (email !== req.decoded.email) {
      //   // return res.status(403).send({ message: "forbidden access" });
      // }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let HR = false;
      if (user) {
      HR = user?.selectedRole === "HR";
      }
      res.send({ HR });
    });

    app.get("/users",  async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          selectedRole: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    // delete user
    
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    //   riview data
    app.post("/contact", async (req, res) => {
      const newsit = req.body;

      const result = await contactCollection.insertOne(newsit);
      res.send(result);
    });
    app.post("/riview", async (req, res) => {
      const newsit = req.body;

      const result = await riviewCollection.insertOne(newsit);
      res.send(result);
    });
    app.get("/riview", async (req, res) => {
      const cursor = riviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // spacipic user details

    app.get("/users/:id",  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

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
