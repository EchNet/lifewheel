const express = require('express');
const morgan = require("morgan")

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use(morgan("tiny"))           // Minimal logging of web requests.
  .use(express.static("static"))   // Serve generated Javascripts.
  .get("/", (req, res) => {
    res.redirect("index.html")
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
