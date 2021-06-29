import * as crypto from "crypto-js";
import * as axios from "axios";
import { Pair } from "../../domain/pair";
import { OrderBook, OrderBookRow } from "../../domain/orderBook";
import { TradeViewModel } from "../../domain/trade";;
import { OrderStatus } from "../../domain/orderStatus";
import { OkexRepositoryError} from "../../domain/errors";
import { Service } from "typedi";

/**
 * Wraps api calls to OKEX API.
 */
export interface IOkexRepository{
    /**
     * Get's authenticated user balance for a given pair in USD.
     * @param pair Pair we want to get balance of.
     */
    getBalance: (pair: string) => Promise<Number>;
    /**
     * Get's a pair / instrument order book. Order book depth is defaulted to 50.
     * @param pair Orderbook pair.
     * @param instrument Orderbook instrument type (SPOT, SWAP, FUTURE, OPTIONS)
     * @returns Order Book object.
     */
    getOrderBook: (pair: Pair, instrument: string) => Promise<OrderBook>;
    /** 
     * Post a swap trade request to Okex Exchange
     * @param pair Pair to trade.
     * @param operation Trading Operation. BUY / SELL.
     * @param price Trading Price.
     * @param size Trading Volume.
     * @returns Trade object
    */
   postTrade: (trade: TradeViewModel) => Promise<TradeViewModel>;
    /**
     * Get's a trade from client.
     * @param trade Trade to fetch.
     * @returns Trade object updated.
     */
    getTrade: (trade: TradeViewModel) => Promise<TradeViewModel>;
}

export class DefaultOkexRepository implements IOkexRepository {
    readonly _apiKey: string;
    readonly _secretKey: string;
    readonly _passPhrase: string;
    readonly _baseUrl: string;

    constructor(apiKey: string, secretKey: string, passPhrase: string){
        this._apiKey = apiKey;
        this._secretKey = secretKey;
        this._passPhrase = passPhrase;
        this._baseUrl = 'https://www.okex.com';
    }
    
    _getApiSignature = (timestamp: string, method: string, path: string, body: string | null) => {
        const preHash = body ? timestamp + method + path + body : timestamp + method + path;
        const sha256 = crypto.HmacSHA256(preHash, this._secretKey);

        return crypto.enc.Base64.stringify(sha256);
    }

    _getTime = async () => {
        const method = 'GET'
        const path = '/api/v5/public/time'

        const response = await axios.default({
                method,
                url: this._baseUrl + path,
        });

        return new Date(Number(response.data.data[0].ts)).toISOString()
    }

    _getHeaders = async (path: string, method: string, body: string | null) => {
        const timestamp = await this._getTime();
        
        return {
            'OK-ACCESS-KEY': this._apiKey,
            'OK-ACCESS-SIGN': this._getApiSignature(timestamp,method,path,body),
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this._passPhrase,
            'x-simulated-trading': 1
        };
    }

    getBalance = async (currency: string) => {
        const method = 'GET';
        const path = '/api/v5/account/balance';
        

        try{   
            const headers = await this._getHeaders(path, method, null);

            const response = await axios.default({
                method,
                url: this._baseUrl + path,
                headers
            });

            return parseFloat(response.data.data[0].totalEq);
        }catch(error){
            throw new OkexRepositoryError(`Client failed error code: ${error.response.data.code}: ${error.response.data.msg}`, error.response.status);
        }
    }
    
    getOrderBook = async (pair: Pair, instrument: string) => {
        const method = 'GET';
        const path = '/api/v5/market/books';
        
        try{
            const response = await axios.default({
                method,
                params:{
                    instId: pair.toString(),
                    sz: 100
                },
                url: this._baseUrl + path
            })

            if(response.data.code != '0'){
                throw new OkexRepositoryError(`Client failed error code: ${response.data.code}: ${response.data.msg}`,'500');
            }

            const asks = response.data.data[0].asks.map((ask: any[]) => {
                return new OrderBookRow(parseFloat(ask[0]),parseFloat(ask[1]),parseFloat(ask[3]),parseFloat(ask[2]));
            });

            const bids = response.data.data[0].bids.map((bid: any[]) => {
                return new OrderBookRow(parseFloat(bid[0]),parseFloat(bid[1]),parseFloat(bid[3]),parseFloat(bid[2]));
            });

            return new OrderBook(instrument,pair,asks,bids,Number(response.data.data[0].ts));
        }catch(error){
            if(error instanceof OkexRepositoryError) throw error;
            throw new OkexRepositoryError(`Client failed error code: ${error.response.data.code}: ${error.response.data.msg}`, error.response.status);
        }

    }

    postTrade = async(trade: TradeViewModel) => {
        const method = 'POST';
        const path = '/api/v5/trade/order';
        const data = {
            "instId": trade.pair,
            "tdMode": "cash",
            "side": trade.operation.toLowerCase(),
            "ordType": "limit",
            "px": trade.price,
            "sz": trade.size
        }
        
        try{
            const headers = await this._getHeaders(path,method,JSON.stringify(data))

            const response = await axios.default({
                method,
                url: this._baseUrl + path,
                data,
                headers
            })
            
            if(response.data.data[0].sCode != '0'){
                throw new OkexRepositoryError(`Client failed error code: ${response.data.data[0].sCode}: ${response.data.data[0].sMsg}`,'500');
            }

            trade.exchangeId = response.data.data[0].ordId;
            trade.status = OrderStatus.PENDING;

            return trade;
        }catch(error){
            if(error instanceof OkexRepositoryError) throw error;
            throw new OkexRepositoryError(`Client failed error code: ${error.response.data.code}: ${error.response.data.msg}`, error.response.status);
        }
    }

    _mapTradeStatus(state: string){
        const stateMap: {[key: string]: string;}  = {
        'canceled' : OrderStatus.CANCELLED,
        'live': OrderStatus.PENDING,
        'partially_filled' : OrderStatus.PENDING,
        'filled': OrderStatus.FULFILLED
        }        

        return stateMap[state]
    }
    
    getTrade = async(trade: TradeViewModel) => {
        const method = 'GET';
        const path = '/api/v5/trade/order' + `?instId=${trade.pair}&ordId=${trade.exchangeId}`;
        const headers = await this._getHeaders(path,method,null)

        try{
            const response = await axios.default({
                method,
                headers,
                url: this._baseUrl + path
            })

            trade.status = this._mapTradeStatus(response.data.data[0].state);
            trade.fee = response.data.data[0].fee;
            trade.feeCurrency = response.data.data[0].feeCcy;
            trade.fillPrice =  response.data.data[0].fillPx;
            trade.fillSize = response.data.data[0].fillSz;
            trade.executedAt = response.data.data[0].fillTime ? new Date(Number(response.data.data[0].fillTime)).toISOString() : null;
        
            return trade;
        }catch(error){
            if(error instanceof OkexRepositoryError) throw error;
            throw new OkexRepositoryError(`Client failed error code: ${error.response.data.code}: ${error.response.data.msg}`, error.response.status);
        }
    }
}