const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const https = require("https");
const fs = require("fs");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const passport = require('passport');
const session = require('express-session');

const app = express();

app.use(express.json({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
// app.use(session({
//     secret: config.get('sessionSecret'), // Add sessionSecret to your config
//     resave: false,
//     saveUninitialized: true,
// }));

// // Initialize passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Passport serialize and deserialize user
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((obj, done) => done(null, obj));

// // Google Strategy
// passport.use(new GoogleStrategy({
//     clientID: config.get('googleClientID'), // Add to your config
//     clientSecret: config.get('googleClientSecret'), // Add to your config
//     callbackURL: "/api/auth/google/callback"
// },
//     function (accessToken, refreshToken, profile, done) {
//         // Here, you would find or create a user in your database
//         done(null, profile);
//     }
// ));

// // LinkedIn Strategy
// passport.use(new LinkedInStrategy({
//     clientID: config.get('linkedInClientID'), // Add to your config
//     clientSecret: config.get('linkedInClientSecret'), // Add to your config
//     callbackURL: "/api/auth/linkedin/callback",
//     scope: ['r_emailaddress', 'r_liteprofile'],
// },
//     function (accessToken, refreshToken, profile, done) {
//         // Similarly, find or create a user in your database
//         done(null, profile);
//     }
// ));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/creditcards', require('./routes/creditCards.routes'));
app.use('/api/routes', require('./routes/routes.routes'));
app.use('/api/transports', require('./routes/transports.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/tickets', require('./routes/tickets.routes'))
app.use('/api/favourites', require('./routes/favourites.routes'))

const PORT = config.get('port') || 5000;

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const httpsServer = https.createServer(
            {
                key: fs.readFileSync("./cert/L.key"),
                cert: fs.readFileSync("./cert/L.crt"),
            },
            app);

        httpsServer.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`)
        });

    } catch (e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}

start();

