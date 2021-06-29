import express, { Application, Request, Response, NextFunction } from 'express'
import {container} from '../config/index';

const app: Application = express();

app.get('/ping', (request: Request, response: Response) => response.status(200).send('pong'));

app.get('/trade', (request: Request, response: Response) => container.traderController.getBestTrade(request,response));

app.get('/trade/:id', (request: Request, response: Response) => container.traderController.getTrade(request,response));

app.post('/trade/:id', (request: Request, response: Response) => container.traderController.executeTrade(request,response));

export const server = app

