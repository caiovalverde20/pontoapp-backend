import express from 'express';
import router from './routes';
import cors from 'cors';
import { initializeDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

if (process.env.NODE_ENV !== 'test') {
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start the server due to database error:', err);
      process.exit(1);
    });
}

export default app;
