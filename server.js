const express = require('express');
const bodyParser = require('body-parser');
const pdfkit = require('pdfkit');
const fs = require('fs');
const listEndpoints = require('express-list-endpoints');
const uniqid = require('uniqid');
const cors = require('cors');


const app = express();


let medias;

try {
    medias = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch(e) {
    medias = [];
}

app.use(bodyParser.json());
app.use(cors());


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

app.post('/medias/:id/poster', (req, res) => {
  const media = medias.find(m => m.id === req.params.id);
  if (media) {
    media.poster = req.body.poster;
    res.status(200).json({ message: 'Poster uploaded successfully.' });
  } else {
    res.status(404).send(`Media not found with id: ${req.params.id}`);
  }
});

app.get('/medias/:id/pdf', (req, res) => {
  const media = medias.find(m => m.id === req.params.id);
  if (media) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=' + media.title + '.pdf');
    const pdf = new pdfkit();
    pdf.pipe(res);
    pdf.text('Title: ' + media.title);
    pdf.text('Year: ' + media.year);
    pdf.text('imdbID: ' + media.imdbID);
    pdf.text('Type: ' + media.type);
    pdf.text('Poster: ' + media.poster);
    pdf.end();
  } else {
    res.status(404).send(`Media not found with id: ${req.params.id}`);
  }
});

console.log(listEndpoints(app));


app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
