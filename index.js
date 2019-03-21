// Following guide here (more or less):
// https://developer.amazon.com/docs/login-with-amazon/minitoc-lwa-websites.html

const secrets = require('./secrets');
const config = require('./config');
const https = require('https');
const fs = require('fs');

/** type: Axios */
const axios = require('axios');

const options = {
    cert: fs.readFileSync('./fullchain.pem'),
    key: fs.readFileSync('./privkey.pem')
};

const express = require('express');

const app = express();

app.get("/return", async (req, res, next) => {
    console.log(req.query);
    const response = await axios.get(`https://api.amazon.com/user/profile`, {
        headers: {
            "Authorization": `Bearer ${req.query.access_token}`
        }
    });
    const {data} = response;
    console.log(data);
    res.send(`
    <html>
        <body>
        You are ${data.name}, logged in with your Amazon account tied to email ${data.email}.<br/>
        You are in our system as ${data.user_id}.
        Welcome to cuylerstuwe.com!
        </body>
    </html>
    `);
});

app.get("/", (req, res, next) => {
    res.send(`
    <div id="amazon-root"></div>
    <script type="text/javascript">
   
       window.onAmazonLoginReady = function() {
         amazon.Login.setClientId('${secrets.id}');
       };
       (function(d) {
         var a = d.createElement('script'); a.type = 'text/javascript';
         a.async = true; a.id = 'amazon-login-sdk';
         a.src = 'https://assets.loginwithamazon.com/sdk/na/login1.js';
         d.getElementById('amazon-root').appendChild(a);
       })(document);
   
   </script>

   <a href id="LoginWithAmazon">
    <img border="0" alt="Login with Amazon"
        src="https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA_gold_156x32.png"
        width="156" height="32" />
   </a>

   <script type="text/javascript">
    document.getElementById('LoginWithAmazon').onclick = function() {
    options = { scope : 'profile' };
    amazon.Login.authorize(options,
        'https://www.cuylerstuwe.com:54321/return');
    return false;
    };
   </script>
    `);
});

app.listen(54320, "0.0.0.0");
https.createServer(options, app).listen(54321);