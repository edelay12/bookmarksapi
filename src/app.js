require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const logger = require("./logger");
const bookRouter = require("./Books/books-route");
const BookmarkService = require("./bookmark-service");
const xss = require('xss');

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
const jsonParser = express.json();

app.use(function validateToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  console.log(apiToken);
  const authToken = req.get("Authorization");
console.log(authToken)
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

app.use(bookRouter);

app.get("/books", (req, res, next) => {
  const knexInstance = req.app.get("db");

  BookmarkService.getList(knexInstance)
    .then(items => {
      res.json(items);
    })
    .catch(next);
});

app.get("/books/:book_id", (req, res, next) => {
  const knexInstance = req.app.get("db");

  BookmarkService.getById(knexInstance, req.params.book_id)
    .then(bookmark => {
      res.json(bookmark);
    })

    .catch(next);
});

app.delete('/books/:book_id' ,(req, res, next) => {
  BookmarkService.deleteItem(
      req.app.get('db'),
      req.params.book_id
  )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
    });

app.post("/books", jsonParser, (req, res, next) => {
  const { name, link, description, rating } = req.body;
  const newItem = { name, link, description , rating };

  for (const [key, value] of Object.entries(newItem))
    if (value == null)
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` }
      });

  BookmarkService.postItem(req.app.get("db"), newItem)
    .then(bookmark => {
      res
        .status(201)
        .location(`/books/${bookmark.id}`)
        .json(serializeItem(newItem));
    })
    .catch(next);
});

const serializeItem = article => ({
  key_id: article.id,
  name: article.name,
  link: xss(article.link),
  description: xss(article.description),
  rating: article.rating
});
//update -----------


   app.patch( '/books/:book_id' ,jsonParser, (req, res, next) => {
     const { name, link, description, rating } = req.body
     const newItem = { name, link, description, rating }
  
     const numberOfValues = Object.values(newItem).filter(Boolean).length
        if (numberOfValues === 0) {
          return res.status(400).json({
            error: {
              message: `Request body must contain either 'name', 'link' or 'rating'`
            }
          })
        }
     
    BookmarkService.updateItem(
       req.app.get('db'),
       req.params.book_id,
       newItem
     )
     .then(numRowsAffected => {
       res.location('/books')
       .status(204).end()
    })
       .catch(next)
    })


app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
