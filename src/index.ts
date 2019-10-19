require('dotenv').config();

import path from 'path';
import express from 'express';
import 'express-async-errors';
import sendToKindle from './routes/sendToKindle';

// TODO:
// * Cookie for remembering kindle email and username.

const app = express();

// Middlewares
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => res.redirect('/send-to-kindle'));
app.use('/send-to-kindle', sendToKindle);

// Let's a go!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Feedbin-Pages-Kindle started on port ${PORT}!`),
);
