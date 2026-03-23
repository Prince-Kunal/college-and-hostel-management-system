import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { auth } from "./firebase.js";

console.log(auth);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

export default app;
