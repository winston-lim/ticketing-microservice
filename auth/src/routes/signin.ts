import express from 'express';

const router = express.Router();

router.post('/api/users/signin', (req, res) => {
  res.send('Signed in current user');
});

export { router as signInRouter };
