const express = require('express');
const Steggo = require("stegcloak");
const bodyParser = require('body-parser');
const fs = require('fs');
const router = express.Router();
const app = express();

const steggo = new Steggo(true);
const UrlRegex = new RegExp(
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/,"ig"
);

var api_calls;
var encryption_calls;
var decryption_calls;
var urls_found;
var api_errors;

function collectData() {
  fs.readFile("./stats.json", "utf-8", (err, data) => {
    if (err) return;
    jsonData = JSON.parse(data);
    console.log(jsonData);
    api_calls = jsonData.api_calls;
    encryption_calls = jsonData.encryption_calls;
    decryption_calls = jsonData.decryption_calls;
    urls_found = jsonData.urls_found;
    api_errors = jsonData.api_errors;
    return;
  })
}


let stats = {
  api_calls: api_calls,
  encryption_calls: encryption_calls,
  decryption_calls: decryption_calls,
  urls_found: urls_found,
  api_errors : api_errors
}


app.use(function(req, res, next) {
  res.setHeader('charset', 'utf-8')
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use("/", router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/keepalive', (req, res) => {
  res.send("Alive");
});

app.get('/stats', (req, res) => {
  res.status(200).json({
    api_calls: api_calls,
    encryption_calls: encryption_calls,
    decryption_calls: decryption_calls,
    urls_found: urls_found,
    api_errors: api_errors
  }).end();
});

app.post('/', (req, res) => {
  var type = req.body.type;
  var password = req.body.password;
  var secret = req.body.secret;
  var cover = req.body.cover;

  // Stats
  api_calls++;
  console.log(api_calls);
  if (api_calls % 5 == 0) {
    stats.api_calls = api_calls;
    stats.encryption_calls = encryption_calls;
    stats.decryption_calls = decryption_calls;
    if (type === "hide") stats.encryption_calls++
    if (type === "reveal") stats.decryption_calls++
    stats.urls_found = urls_found;
    stats.api_errors = api_errors;
    actStats = JSON.stringify(stats, null, 2);
    fs.writeFile("./stats.json", actStats, (err) => {
      if (err) throw err;
    });
  }
  // End Stats

  try {
    // Encryption
    if (type == "hide") {
      encryption_calls++;
      if (!password || !secret || !cover) {
        api_errors++
        return res.status(400).json({
          status: 'error',
          error: 'password, secret and cover must be filled'
        }).end()
      }

      var result = steggo.hide(`${secret} ­­­`, `${password}`, `${cover}`);
      return res.status(200).json({response: `${result}`}).end()
    }
    // Decryption
    if (type == "reveal") {
      decryption_calls++;
      if (!password || !secret) {
        api_errors++
        return res.status(400).json({
          status: 'error',
          error: 'password, secret and cover must be filled'
        }).end()
      }

      var result = steggo.reveal(`${secret}`, `${password}`);
      var foundUrls = "";
      var isCorrect = false;
      if (result.match(UrlRegex)) {
        urls_found++;
        foundUrls = result.match(UrlRegex)[0];
      }
      if (result.endsWith(' ­­­')) {
         isCorrect = true;
         result = result.replace(' ­­­', '')
      }


      return res.status(200).json({response : `${result}`, url: `${foundUrls}`, isCorrectPassword: `${isCorrect}` }).end();
      // Others (Error)
    } else {
      api_errors++
      return res.status(400).json({
        status: 'error',
        error: 'you need to specify a type'
      }).end();
    }
  } catch(e) {
    api_errors++
    console.log(e);
    return res.status(400).json({response : `${e}`}).end()
  }
})

app.listen(3000, async () => {
  await collectData();
  console.log('server started');
});
