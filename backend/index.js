import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import initializePassport from './passport-config.js'; // Adjust the path to your passport configuration
import authRoute from './routes/Auth.route.js'; // Adjust the path to your User route
import userRoute from './routes/User.route.js'; // Adjust the path to your User route
import dotenv from "dotenv"
import flash from "connect-flash"
dotenv.config();
let app = express();

let PORT = 3001

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS for your frontend (adjust the origin)
app.use(cors({
  origin: 'http://localhost:5173', // React frontend URL
  credentials: true, // Allow cookies to be sent
}));

/**app.use(cors({
  origin: 'http://localhost:3000', // React frontend URL
  credentials: true, // Allow cookies to be sent
}));
 */
const KEY = '768069b2596807f59c5600ff61acd8ade6ce1b9b0f5c6c391e82d5f95cd822cc'
// Session Configuration
app.use(session({
  secret: KEY, // Replace with a secure key
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // True uniquement en HTTPS
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax', // Autorise les requêtes inter-origines
  },
}));

/*HTTPS : 

cookie: {
    httpOnly: true,
    secure: true, // True uniquement en HTTPS
    sameSite: 'None', // Autorise les requêtes inter-origines
  },



*/
app.use(flash());

initializePassport(passport);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());




app.use("/auth",authRoute);
app.use("/user",userRoute);





// Sample Route
app.get('/', (req, res) => {
  res.send('Welcome to the Express App!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
