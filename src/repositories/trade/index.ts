import { Trade, TradeViewModel } from "../../domain/trade";
import { Pair } from "../../domain/pair";
import { Constants } from "../../domain/constants";
import { OrderStatus } from "../../domain/orderStatus";
import { uuid } from 'uuidv4';

export interface ITradeRepository {
    /**
     * Creates a new Pending Trade from parameters.
     * @param price Trade intended price
     * @param size Trade intended volume
     * @param operation Buy or sell
     * @param instrument SPOT, SWAP, FUTURE, OPTIONS. Default: SPOT
     */
    new: (pair: Pair, price: string, size: string, operation: string, instrument: string) => TradeViewModel;
    /**
     * Post a trade to database.
     * @param trade Trade to post.
     */
    post: (trade: TradeViewModel) => Promise<void>;
    /**
     * Update an existing trade in database
     * @param trade Trade to update.
     */
    update: (trade: TradeViewModel) => Promise<void>;
    /**
     * Get's a trade from database.
     * @param id Trade id.
     * @returns a trade.
     */
    getById: (id: string) => Promise<TradeViewModel |  null>;
    /**
     * Get's a list of pending trades from database.
     * @returns a list of pending trades.
     */
    getPendingTrades: () => Promise<TradeViewModel[]>;
}

export class DefaultTradeRepository implements ITradeRepository {
    

    constructor(){}

    new = (pair: Pair, price: string, size: string, operation: string, instrument: string) => {
        const currentDate = new Date();
        
        const result: TradeViewModel = {
            price,
            size,
            operation,
            pair: pair.toString(),
            instrument: instrument,
            status: OrderStatus.UNPLACED,
            fee: null,
            feeCurrency: null,
            fillSize: null,
            fillPrice: null,
            id: uuid(),
            exchangeId: null,
            executeBefore: (new Date(currentDate.getTime() + Constants.TIME_LOCK)).toISOString(),
            executedAt: null
        }
        
        return result;
    }

    post = async(trade: TradeViewModel) => {
        await Trade.create(trade);
    }

    update = async(trade: TradeViewModel) => {
        await Trade.upsert({
            id: trade.id,
            status: trade.status,
            exchangeId: trade.exchangeId,
            price: trade.price,
            size: trade.size,
            operation: trade.operation,
            pair: trade.pair,
            fee: trade.fee,
            feeCurrency: trade.feeCurrency,
            fillSize: trade.fillSize,
            fillPrice: trade.fillPrice,
            instrument: trade.instrument,
            executeBefore: trade.executeBefore,
            executedAt: trade.executedAt
        })
    }

    getById = async(id: string) => {
        const trade = await Trade.findByPk(id);
        return trade;
    }

    getPendingTrades = async() => {
        const result = await Trade.findAll({where: {status: OrderStatus.PENDING}})
        return result;
    }
}