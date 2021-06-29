import { IOkexRepository } from "../../repositories/okex";
import { Pair } from "../../domain/pair";
import { Instrument } from "../../domain/instrument";
import { Operation } from "../../domain/operation";
import { OrderBookRow } from "../../domain/orderBook";
import { ITradeRepository } from "../../repositories/trade";
import { TradeViewModel, Trade } from "../../domain/trade";
import { Service } from "typedi";
import { TraderError } from "../../domain/errors";
import { OrderStatus } from "../../domain/orderStatus";



export interface  ITraderService {
    /**
     * Given a pair, a trade volume and operation, returns a trade with the best price available for given params.
     * @param pair Pair to trade
     * @param size Size of trade
     * @param operation Trade operation. BUY or SELL.
     * @returns A trade object with best price found for given size & pair.
     */
    getBestTrade: (pair: Pair, size: string, operation: string) => Promise<TradeViewModel>;

    /**
     * Given a trade, executes against broker.
     * @param tradeId Trade Id to execute.
     * @returns Trade with modified status. 
     */
    executeTrade: (tradeId: string) => Promise<TradeViewModel>;

    /**
     * Given a trade id, returns it's status.
     * @param tradeId Trade Id to execute.
     * @returns Updated trade.
     */
    getTrade: (tradeId: string) => Promise<TradeViewModel>;
}

export class DefaultTraderService implements ITraderService{
    _okexRepository: IOkexRepository;
    _tradeRepository: ITradeRepository;
    
    constructor(okexRepository: IOkexRepository, tradeRepository: ITradeRepository){
        this._okexRepository = okexRepository;
        this._tradeRepository = tradeRepository;
    }

    _getBestPrice = (orders: [OrderBookRow], size: string) => {
        let allocatedVolume: number = 0;
        let price: number = 0;
        const totalVolume = parseFloat(size);

        orders.some(order => {
            let tradeableSize = order._size;
            if(allocatedVolume + order._size > totalVolume){
                tradeableSize = totalVolume - allocatedVolume; //Adjust order to add missing volume to match totalVolume
            }
            allocatedVolume += tradeableSize;
            price += (tradeableSize / totalVolume) * order._price;
            if(allocatedVolume >= totalVolume){
                return true;
            }
        })

        return price.toString()
    }

    getBestTrade = async (pair: Pair, size: string, operation: string) => {
        const orderBook = await this._okexRepository.getOrderBook(pair, Instrument.SPOT);

        console.log(`Looking for best opportunity to ${operation} ${size} ${pair.toString()} between range: ${ 
            operation === Operation.BUY  
            ? orderBook.bids[0].price + '   ' + orderBook.bids[orderBook.bids.length - 1].price 
            : orderBook.asks[0].price + '   ' + orderBook.asks[orderBook.asks.length - 1].price}`)
        const price = this._getBestPrice(operation === Operation.BUY ? orderBook._bids.reverse() as [OrderBookRow] : orderBook._asks.reverse() as [OrderBookRow], size);

        console.log(`Best price found to ${operation} ${size} ${pair.toString()}.Price is: ${price}`);

        const trade = this._tradeRepository.new(pair,price,size,operation,Instrument.SPOT);
        await this._tradeRepository.post(trade);
        return trade;
    }

    _isExecutableTrade(trade: TradeViewModel){
        const executeBefore = new Date(trade.executeBefore);
        const currentDate = new Date();

        if(trade.status != OrderStatus.UNPLACED){
            throw new TraderError(`Trade ${trade.id} was already placed`, `400`)
        }

        if(currentDate > executeBefore){
            throw new TraderError(`Time Lock expired for trade ${trade.id}`, `400`)
        }
    }

    executeTrade = async (tradeId: string) => {
        const trade = await this._tradeRepository.getById(tradeId) as TradeViewModel;

        this._isExecutableTrade(trade)
        
        await this._okexRepository.postTrade(trade);
        await this._tradeRepository.update(trade);
        
        return trade;
    }

    getTrade = async (tradeId: string) => {
        const trade = await this._tradeRepository.getById(tradeId) as TradeViewModel;
        if(!trade) throw new TraderError(`Trade ${tradeId} does not exists`, `404`)

        if(trade.exchangeId) {
            const okexTrade = await this._okexRepository.getTrade(trade);
            this._tradeRepository.update(okexTrade);
            return okexTrade;
        }

        return trade;
    }
} 