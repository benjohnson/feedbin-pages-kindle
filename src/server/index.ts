require('dotenv').config();

import path from 'path';
import express from 'express';
import 'express-async-errors';
import Joi from 'joi';
import * as feedbin from './feedbin';

const app = express();

// Middlewares
app.use(
  '/static',
  express.static(path.join(__dirname, '../../', 'src', 'server', 'static')),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../', 'src', 'server', 'views'));

// Routes
app.get('/', (req, res) => res.redirect('/send-to-kindle'));
app.get('/send-to-kindle', (req, res) => res.render('index', { errors: [] }));

const sendToKindleSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  kindle: Joi.string()
    .email()
    .regex(/@kindle.com/, 'kindle email')
    .required(),
});

app.post('/send-to-kindle', async (req, res) => {
  const returnError = errors => {
    if (req.accepts(['html', 'json']) === 'json') {
      return res.status(400).json({ errors });
    }
    return res.render('index', { errors });
  };

  // Check Params
  const { value: params, error } = sendToKindleSchema.validate(req.body);
  if (error) {
    return returnError(error.details.map(x => x.message));
  }

  // Validate Feedbin Credentials
  const feedbinAuthed = await feedbin.validateCredentials(
    params.username,
    params.password,
  );
  if (!feedbinAuthed) {
    return returnError(['Invalid Feedbin Credentials!']);
  }

  // If they're valid, throw it in the queue.
  res.send(params);
});

// Let's a go!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Feedbin-Pages-Kindle started on port ${PORT}!`),
);
