import express, { json, urlencoded } from "express";
import cors from "cors";
import { errors } from 'celebrate';
import { loginRoute, runTemplateRoute } from './routes';

const app = express();
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());
app.options('*', cors());

app.get('/', (_, res) => res.send('It works!!!'));
app.use('/login', loginRoute);
app.use('/runTemplate', runTemplateRoute);

app.use(errors()); // 'celebrate' lib error

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("App listening at port " + PORT));