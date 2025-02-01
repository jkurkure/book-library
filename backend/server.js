const express = require("express");
const mongoose = require("mongoose");
const { CosmosClient } = require("@azure/cosmos");
const cors = require("cors");

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());
app.use(express.json());

const endpoint = "https://azure-endpoint.documents.azure.com:443";
const key = "replace-with-secret-key";
const cosmosClient = new CosmosClient({ endpoint, key });
const database = cosmosClient.database("Book");
const container = database.container("book");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
});

const Book = mongoose.model("Book", bookSchema);

app.post("/books", async (req, res) => {
  const { title, author, description } = req.body;
  const newBook = {
    id: new mongoose.Types.ObjectId().toString(),
    title,
    author,
    description,
  };

  await container.items.create(newBook);
  res.status(201).send(newBook);
});

app.get("/books", async (req, res) => {
  const { resources: books } = await container.items
    .query("SELECT * from c")
    .fetchAll();
  res.status(200).send(books);
});

app.put("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, description } = req.body;
  const { resource: updatedBook } = await container
    .item(id)
    .replace({ id, title, author, description });
  res.status(200).send(updatedBook);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
