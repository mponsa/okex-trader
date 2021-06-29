import { Request, Response } from "express";
import { Service } from "typedi";
import { Pair } from '../../domain/pair';
import { ITraderService } from "../../services/trader";

export class TraderController{

    constructor(private readonly traderService: ITraderService){}

    _validateParams = (query: any) => {
        if(!query.pair || !query.operation || !query.size){
            return false
        }

        return true
    }

    getBestTrade = async(req: Request, res: Response) => {
        if(!this._validateParams(req.query)){
            res.status(400).send('Missing querry params in request.');
            return
        }
        
        const queryPair = <string> req.query.pair;
        const operation = <string> req.query.operation;
        const size = <string> req.query.size;
        const pair = new Pair(queryPair.split('-')[0],queryPair.split('-')[1])
        
        try{
            const result = await this.traderService.getBestTrade(pair,size,operation);
            res.status(200).send(result);8
            return;
        }catch(error){
            res.status(error.code ? Number(error.code) : 500).send({
                msg: error.message
            });
            return;
        }

    }

    executeTrade = async(req: Request, res: Response) => {
        const tradeId = <string> req.params.id;

        try{
            const result = await this.traderService.executeTrade(tradeId)
            res.status(200).send(result);
        }catch(error){
            res.status(error.code ? Number(error.code) : 500).send({
                msg: error.message
            });
        }
    }

    getTrade = async(req: Request, res: Response) => {
        const tradeId = <string> req.params.id;
        try{
            const result = await this.traderService.getTrade(tradeId)
            res.status(200).send(result);
        }catch(error){
            res.status(error.code ? Number(error.code) : 500).send({
                msg: error.message
            });
        }
    }
}