export class Pair {
    _buy: string;
    _sell: string;

    constructor(buy: string, sell: string){
        this._buy = buy;
        this._sell = sell;
    }

    toString(){
        return this._buy + '-' + this._sell;
    }
}