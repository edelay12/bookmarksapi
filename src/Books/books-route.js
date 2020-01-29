const logger = require('../logger')
const BOOKS = require('../STORE')
const express = require('express')
const bookRouter = express.Router()
const bodyParser = express.json()
const uuid = require('uuid/v4')

const BOOKS2 = [];
bookRouter.route('/bookmarks')
  .get((req, res) => {
   res.send(BOOKS)
  })
  .post(bodyParser, (req, res) => {

    const { title , link, description, rating } = req.body;
    console.log(req.body)
    if (!title) {
      logger.error(`Title is required`);
      return res
        .status(400)
        .send('Invalid title');
    }
    
    if (!link) {
      logger.error(`Content is required`);
      return res
        .status(400)
        .send('Invalid link');
    }

    if (!rating) {
      logger.error(`Rating is required`);
      return res
        .status(400)
        .send('Invalid rating');
    }

    const id = uuid();

const bookmark = {
  id,
  title,
  link,
  description,
  rating
};

BOOKS.push(bookmark);

//log and send location
logger.info(`Bookmark with id ${id} created`);

res
  .status(201)
  .location(`http://localhost:8000/bookmarks/${id}`)
  .json(bookmark);
  })

  bookRouter.route('/bookmarks/:id')
    .get((req,res) => {
console.log(req.params)
      let  id1 = req.params;
      console.log(id1)
      const result = BOOKS.find(b => b.id == id1);

      // make sure found a bookmark
    if (!result) {
          logger.error(`Bookmark with id ${id1} not found.`);
          return res
            .status(404)
           .send('Bookmark Not Found');
         }
      res.send(result)
    })
    .delete((req , res) => {
      let { id1 } = req.params;
      const bookIndex = BOOKS.findIndex(b => b.id == id1);
      console.log(bookIndex)

      
if(!bookIndex || bookIndex == undefined){
        logger.error(`Bookmark with id ${id1} not found.`);
        return res 
        .status(404)
        .send('There is no bookmark found')
      }
     
      console.log('1 ' + BOOKS)
    
      BOOKS.splice(bookIndex, 1);
      console.log('2' + BOOKS)

      //const end = BOOKS.length;
     // if(start < end) {
        logger.info(`Bookmark with ${id1} was deleted`);
        res.status(204).end();

    //  }
      
    });

module.exports = bookRouter;