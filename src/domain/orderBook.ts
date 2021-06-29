import { Pair } from "./pair";


export class OrderBookRow {
    _price: number;
    _size: number;
    _orderCount: number;
    _liquidatedOrderCount: number;
    

    constructor(price: number, size: number, orderCount: number, liquidatedOrderCount: number){
        this._price = price;
        this._size = size;
        this._orderCount = orderCount;
        this._liquidatedOrderCount = liquidatedOrderCount;
    }

    get price(){
        return this._price;
    }

    get size(){
        return this._size;
    }

    get orderCount(){
        return this._orderCount;
    }
}


export class OrderBook {
    _instrument: string;
    _pair: Pair;
    _asks: [OrderBookRow];
    _bids: [OrderBookRow];
    _timestamp: number; 

    constructor(instrument: string, pair: Pair, asks: [OrderBookRow], bids: [OrderBookRow], _timestamp: number){
        this._instrument = instrument;
        this._pair = pair;
        this._asks = asks;
        this._bids = bids;
        this._timestamp = _timestamp;
    }

    get asks(){
        return this._asks;
    }

    get bids(){
        return this._bids;
    }
}



