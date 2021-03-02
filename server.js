const express = require("express");
const bodyParser = require("body-parser");
const https = require("https")
const logger = require("morgan");
const {
    request
} = require("http");
const {
    json
} = require("body-parser");
const { compile } = require("morgan");

const app = express();
app.use(express.static("public"));
app.use(logger("simple"));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html")
});
app.post("/", (req, res) => {
    const fname = req.body.firstName;
    const lname = req.body.lastName;
    const email = req.body.email;

    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: fname,
                LNAME: lname,
            }
        }]
    }
    const jsonData = JSON.stringify(data);

    const url = "https://us1.api.mailchimp.com/3.0/lists/f42b507ce4/"
    const options = {
        method: "POST",
        auth: "rsrs:4ef5bc0ab2fad12a781fb2c7ea5d39bc-us1"
    }

    const request = https.request(url, options, (response) => {
        response.on("data", (d) => {
            errors = JSON.parse(d).error_count;
            if (errors || response.statusCode!=200) {
                console.log(JSON.parse(d));
                res.sendFile(__dirname + "/failure.html");
            } else {
                res.sendFile(__dirname + "/success.html");
            }
        });
    })

    request.write(jsonData);
    request.end();

});

app.post("/failure",(_,res)=>{
    res.redirect("/");
})

app.listen(process.env.PORT || 3000, (req, res) => {
    console.log("Server up at http://localhost:3000");
});