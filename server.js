const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const pdf = new PDFDocument();

const fs = require('fs');
const listEndpoints = require('express-list-endpoints');
const uniqid = require('uniqid');
const cors = require('cors');
const axios = require('axios');
const jsdom = require("jsdom");

const { JSDOM } = jsdom
const options = {};

const app = express();


let medias;

try {
    medias = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch(e) {
    medias = [];
}

app.use(bodyParser.json());
app.use(cors());

OMDB_API_KEY=process.env.OMDB_API_KEY



// ADD COMMENT ENDPOINT

app.post('/medias/:id/comments', (req, res) => {
  const { id } = req.params;
  const media = medias.find(m => m.id === id);
  if (!media) {
      return res.status(404).json({ message: 'Media not found.' });
  }
  const { comment, rate } = req.body;
  if (!comment || !rate || rate > 5) {
      return res.status(400).json({ message: 'Invalid comment or rate.' });
  }
  const newComment = {
      _id: uniqid(),
      comment,
      rate,
      imdbId: id,
      createdAt: new Date()
  };
  if(!media.comments){
    media.comments = []
  }
  media.comments.push(newComment)
  fs.writeFileSync('data.json', JSON.stringify(medias));
  res.json(newComment);
});

// retrieve single comment by ID endpoint

app.get('/medias/:id/comments/:commentId', (req, res) => {
  const { id, commentId } = req.params;
  const media = medias.find(m => m.id === id);
  if (!media) {
      return res.status(404).json({ message: 'Media not found.' });
  }
  if(!media.comments) {
      return res.status(404).json({ message: 'Media comments not found.' });
  }
  const comment = media.comments.find(c => c._id === commentId);
  if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
  }
  res.json(comment);
});


// PUT endpoint for comments

app.put('/medias/:id/comments/:commentId', (req, res) => {
  const { id, commentId } = req.params;
  const media = medias.find(m => m.id === id);
  if (!media) {
      return res.status(404).json({ message: 'Media not found.' });
  }
  if(!media.comments) {
      return res.status(404).json({ message: 'Media comments not found.' });
  }
  const commentIndex = media.comments.findIndex(c => c._id === commentId);
  if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found.' });
  }
  const { comment, rate } = req.body;
  if (!comment || !rate || rate > 5) {
      return res.status(400).json({ message: 'Invalid comment or rate.' });
  }
  media.comments[commentIndex] = { ...media.comments[commentIndex], comment, rate };
  fs.writeFileSync('data.json', JSON.stringify(medias));
  res.json(media.comments[commentIndex]);
});

// DELETE endpoint for comments
app.delete('/medias/:id/comments/:commentId', (req, res) => {
  const { id, commentId } = req.params;
  const media = medias.find(m => m.id === id);
  if (!media) {
      return res.status(404).json({ message: 'Media not found.' });
  }
  if(!media.comments) {
      return res.status(404).json({ message: 'Media comments not found.' });
  }
  const commentIndex = media.comments.findIndex(c => c._id === commentId);
  if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found.' });
  }
  media.comments.splice(commentIndex, 1);
  fs.writeFileSync('data.json', JSON.stringify(medias));
  res.json({ message: 'Comment deleted.' });
});







app.get('/medias/search', async (req, res) => {
    const { title } = req.query;
    const media = medias.find(m => m.title === title);
    if (media) {
      return res.json(media);
    }
    try {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'daa9e658',
                t: title
            }
        });
        if (response.data.Response === "True")  {
        const newMedia = {
          id: uniqid(),
          title: response.data.Title,
          year: response.data.Year,
          imdbID: response.data.imdbID,
          type: response.data.Type,
          poster: response.data.Poster
        }
        medias.push(newMedia);
        fs.writeFileSync('data.json', JSON.stringify(medias));
        res.json(newMedia);
      } else {
        res.status(404).json({ message: 'Media not found.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong.' });
    }
  });app.get('/medias/search', async (req, res) => {
    const { title } = req.query;
    const media = medias.find(m => m.title === title);
    if (media) {
      return res.json(media);
    }
    try {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'daa9e658',
                t: title
            }
        });
        if (response.data.Response === "True")  {
        const newMedia = {
          id: uniqid(),
          title: response.data.Title,
          year: response.data.Year,
          imdbID: response.data.imdbID,
          type: response.data.Type,
          poster: response.data.Poster
        }
        medias.push(newMedia);
        fs.writeFileSync('data.json', JSON.stringify(medias));
        res.json(newMedia);
      } else {
        res.status(404).json({ message: 'Media not found.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong.' });
    }
  });
  
  
  


app.post('/medias', (req, res) => {
  const media = req.body;
  media.id = uniqid();
  medias.push(media);
  fs.writeFileSync('data.json', JSON.stringify(medias));
  res.status(201).json({ message: 'Media created successfully.' });
});

app.get('/medias', (req, res) => {
  res.json(medias);
});

app.get('/medias/:id', (req, res) => {
  const media = medias.find(m => m.id === req.params.id);
  if (media) {
    res.json(media);
  } else {
    res.status(404).send(`Media not found with id: ${req.params.id}`);
  }
});

app.put('/medias/:id/poster', (req, res) => {
    const { id } = req.params;
    const { poster } = req.body;
    const mediaIndex = medias.findIndex(m => m.id === id);
    if (mediaIndex === -1) {
        return res.status(404).json({ message: 'Media not found.' });
    }
    medias[mediaIndex].poster = poster;
    fs.writeFileSync('data.json', JSON.stringify(medias));
    res.status(200).json({ message: 'Poster updated successfully.' });
});

// DELETE ENDPOINT FOR MEDIA FILE
app.delete('/medias/:id', (req, res) => {
  const { id } = req.params;
  const mediaIndex = medias.findIndex(m => m.id === id);
  if (mediaIndex === -1) {
      return res.status(404).json({ message: 'Media not found.' });
  }
  medias.splice(mediaIndex, 1);
  fs.writeFileSync('data.json', JSON.stringify(medias));
  res.json({ message: 'Media deleted.' });
});


app.get('/medias/:id/pdf', (req, res) => {
  const { id } = req.params;
  const media = medias.find(m => m.id === id);
  console.log(id)
  console.log(media)
  console.log(medias.find(m => m.id === id))
  if (!media) {
      return res.status(404).json({ message: 'Media not found.' });
  }
  if(!media.comments) {
      return res.status(404).json({ message: 'Media comments not found.' });
  }
  const { title, year, imdbID, type, poster, comments } = media;
  let commentsHTML = "";
  comments.forEach( comment => {
    commentsHTML += `<li>${comment.comment}</li>`;
  });
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Media Details</title>
  </head>
  <body>
      <h1>${title}</h1>
      <p>Year: ${year}</p>
      <p>imdbID: ${imdbID}</p>
      <p>Type: ${type}</p>
      <img src="${poster}" alt="${title}">
      <h2>Comments</h2>
      <ul>
          ${commentsHTML}
      </ul>
  </body>
  </html>
  `;
  const doc = new PDFDocument();
  res.setHeader('Content-disposition', 'attachment; filename=Movie-details.pdf');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);
  doc.text(html);
  doc.end();
});


  


console.log(listEndpoints(app));



app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
