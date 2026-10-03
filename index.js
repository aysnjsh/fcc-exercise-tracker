require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urls = [];
let nextId = 1;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  let parsedUrl;

  try {
    if (typeof originalUrl !== 'string') {
      throw new Error('invalid url');
    }

    parsedUrl = new URL(originalUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('invalid url');
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    let record = urls.find(item => item.original_url === originalUrl);

    if (!record) {
      record = {
        original_url: originalUrl,
        short_url: nextId++
      };

      urls.push(record);
    }

    res.json(record);
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = Number(req.params.short_url);
  const record = urls.find(item => item.short_url === shortUrl);

  if (!record) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(record.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});