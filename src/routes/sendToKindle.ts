import { Router } from 'express';
import Joi from 'joi';
import * as feedbin from '../feedbin';
import queue from '../queue';

const router = Router();

const sendToKindleSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  kindle: Joi.string()
    .email()
    .regex(/@kindle.com/, 'kindle email')
    .required(),
});

router.get('/', async (req, res) => {
  res.render('index', { errors: [] });
});

router.post('/', async (req, res) => {
  const isJSON = req.accepts(['html', 'json']) === 'json';

  const returnError = errors => {
    if (isJSON) {
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
  const feedbinAuthed = await feedbin.validateCredentials({
    username: params.username,
    password: params.password,
  });
  if (!feedbinAuthed) {
    return returnError(['Invalid Feedbin Credentials!']);
  }

  // If they're valid, throw it in the queue.
  queue.add({
    username: params.username,
    password: params.password,
    kindle: params.kindle,
  });

  if (isJSON) {
    return res.json({ status: 'success' });
  }
  return res.render('success');
});

export default router;
