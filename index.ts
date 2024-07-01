import express, { Request, Response } from 'express';
import 'reflect-metadata';
import { pollResponse, receiveUserRequest } from './src/receive-request';
import { cronJob } from './src/cronjobs';

const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



cronJob.start();

app.post('/user-request', async (req: Request, res: Response) => {
    try {
        await receiveUserRequest(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal error');
    }
});

app.post('/poll-response', async (req: Request, res: Response) => {
    try {
        await pollResponse(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})