# Okex Trading Bot

This typescript demo-app integrates with Okex exhange and gives the best SPOT BUY/SELL for a given cryptocurrency pair and an order size. It also, provides the functionality to execute said Trade given Okex API Key and Secret are loaded as environment variables.

## How to run it

This app is made with docker. Make sure you have installed first and you have a proper .env file. Then run:

````
docker-compose up
````

This starts the app and a mysql database to store trades.

### Enviroment

In order to make this app work, you need to have this variables set up in your .env file at root.

````
API_KEY=<okex api key>
SECRET_KEY=<okex secret>
PASS=<okex passphrase>
USERNAME=<database root user>
PASSWORD=<database root password>
TIME_LOCK=<time in ms which order will prevail>
````
*`TIME_LOCK` here is optional, if you don't set it, it will default to 10000 ms*

### How to run it locally without docker.

Just maker sure you have a proper version of node installed (^10) and a mysql instance running at port 3306.

````
npm i
npm run start-dev
````

### How to run tests.

````
npm test
````

## Endpoints
### Get a single trade.

 `GET /trade` accepts a cryptocurrency pair (ex. BTC-USDT) a size (ex. 0.01) and a operation (BUY or SELL). It searches for available orders in OrderBook to match given size, and returns the best price found for that size.

 `GET /trade?pair=BTC-USDT&size=0.01&operation=BUY` get's the best trade to buy 0.01 Bitcoin with USDT. 
  
  Returns: 

  ````
    {
    "price": "34519.96784625", //Best price found
    "size": "0.02", //Size asked
    "operation": "SELL", 
    "pair": "BTC-USDT",
    "instrument": "SPOT",
    "status": "UNPLACED", //Order status, if unplaced needs to be posted to trader in order to advance.
    "fee": null,
    "feeCurrency": null,
    "fillSize": null,
    "fillPrice": null,
    "id": "2fbebaa8-9a1a-4fe9-9627-c9c634be3ea1", //Order id as stored in database.
    "exchangeId": null,
    "executeBefore": "2021-06-29T03:44:28.097Z", //Time Lock for order, defaults to 10 seconds.
    "executedAt": null
    }
````
### Execute trade

`POST /trade/:id` Posts an unplaced trade to exchange. 

Returns:

````
{
    "status": "PENDING", //Now order is pending.
    "id": "2e7c4331-6ea5-4c47-bb56-a5f2d988ec2c",
    "exchangeId": "329954034400501763", //Okex Exchange Id.
    "price": "2095.46",
    "size": "0.01",
    "operation": "BUY",
    "fee": null,
    "feeCurrency": null,
    "fillPrice": null,
    "fillSize": null,
    "pair": "ETH-USDT",
    "instrument": "SPOT",
    "executeBefore": "2021-06-29T03:59:36.074Z",
    "executedAt": null,
    "createdAt": "2021-06-29T03:59:26.000Z",
    "updatedAt": "2021-06-29T03:59:26.000Z"
}
````

### Get trade status

`GET /trade/:id` Get's a trade from database and updates its status against okex only if order is placed.

Returns:

```
{
    "status": "FULFILLED",
    "id": "2e7c4331-6ea5-4c47-bb56-a5f2d988ec2c",
    "exchangeId": "329954034400501763",
    "price": "2095.46",
    "size": "0.01",
    "operation": "BUY",
    "fee": "-0.00001",
    "feeCurrency": "ETH",
    "fillPrice": "1660",
    "fillSize": "0.01",
    "pair": "ETH-USDT",
    "instrument": "SPOT",
    "executeBefore": "2021-06-29T03:59:36.074Z",
    "executedAt": "2021-06-29T03:59:32.054Z",
    "createdAt": "2021-06-29T03:59:26.000Z",
    "updatedAt": "2021-06-29T03:59:32.000Z"
}
```