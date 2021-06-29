# Okex Trading Bot

This typescript demo-app integrates with Okex exhange and gives the best SPOT BUY/SELL for a given cryptocurrency pair and an order size. It also, provides the functionality to execute said Trade given Okex API Key and Secret are loaded as environment variables.


## Get a single trade.

 `GET /trade` accepts a cryptocurrency pair (ex. BTC-USDT) a size (ex. 0.01) and a operation (BUY or SELL). It searches for available orders in OrderBook to match given size, and returns the best price found for that size.

 `GET /trade?pair=BTC-USDT&size=0.01&operation=BUY` get's the best trade to buy 0.01 Bitcoin with USDT. 
  
  Returns: 

  ````
    {
    "price": "34519.96784625",
    "size": "0.02",
    "operation": "SELL",
    "pair": "BTC-USDT",
    "instrument": "SPOT",
    "status": "UNPLACED",
    "fee": null,
    "feeCurrency": null,
    "fillSize": null,
    "fillPrice": null,
    "id": "2fbebaa8-9a1a-4fe9-9627-c9c634be3ea1",
    "exchangeId": null,
    "executeBefore": "2021-06-29T03:44:28.097Z",
    "executedAt": null
    }
````
## Exe


