const express = require('express');
const bodyParser = require('body-parser');
const pdfkit = require('pdfkit');
const fs = require('fs');
const listEndpoints = require('express-list-endpoints');
const uniqid = require('uniqid');
const cors = require('cors');
const axios = require('axios');


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
