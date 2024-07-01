import { Request, Response } from 'express';
// import uuid from 'uuid';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from './db/config';
import { RequestEntity, RequestStatus } from './entities/request.entity';


// Receive user request
// Wrap it into prompt
// Send it to LLM
// Receive response
// Wrap response with wav
// Send response wav to user

export const receiveUserRequest = async (req: Request, res: Response) => {
    const prompt = req.body.prompt;
    const key = req.body.key;
    const id = req.body.id;
    const contacts = req.body.contacts;
    // Take wav file and send back wav file
    // Send wav file as response
    const request = new RequestEntity();
    request.id = id;
    request.prompt = prompt;
    request.key = key;
    request.contacts = JSON.stringify(contacts);
    request.status = RequestStatus.PROCESSING;
    await AppDataSource.manager.save(request);

    return res.status(200).json({
        id: id,
        status: 'processing'
    });
}

export const pollResponse = async (req: Request, res: Response) => {
    const id = req.body.id;
    try {
        const response = await AppDataSource.manager.findOne(RequestEntity, { where: { id: id } });
        if (!response) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const responseBody = {
            id: id,
            text: response.text || undefined,
            status: response.status,
            file: response.file || undefined
        };

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(responseBody);
    } catch (err) {
        console.error('Error reading or sending file:', err);
        res.status(500).json({ error: 'Error processing audio file' });
    }
}