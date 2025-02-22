const express = require("express");
const app = express();
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y3dh1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("taskManager").collection("users");
    const taskCollection = client.db("taskManager").collection("tasks");


    //users 
    app.get('/users', async(req,res)=>{
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

      app.post("/users", async (req, res) => {
        const user = req.body;
  
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "user already exists", insertedId: null });
        }
  
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

      //tasks

      app.get('/tasks', async (req, res) => {
        const email = req.query.email;
        let filter = {};
        if (email) {
            filter.userEmail = email;  
        }
        const result = await taskCollection.find(filter).toArray();
        res.send(result);
    });

    app.get('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.findOne(query);
      res.send(result);
    });


      app.post('/tasks', async(req,res)=>{
        const tasks =req.body;
        const result=await taskCollection.insertOne(tasks);
        res.send(result);
  
      });

      app.patch('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const { title, description, category } = req.body;
  
        const filter = { _id: new ObjectId(id) };
        const updatedTask = {
          $set: {
            title,
            description,
            category,
          },
        };
  
        const result = await taskCollection.updateOne(filter, updatedTask);
        res.send(result);
      });
  
    
    app.delete('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await taskCollection.deleteOne(query);
        res.send(result);
      });




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("task management server is running");
  });
  
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
  