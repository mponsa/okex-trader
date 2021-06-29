import request from 'supertest'
import { server } from '../src/app'
import * as axios from 'axios';
import { mocked } from 'ts-jest/utils';

jest.mock('axios');

const mockedTrade1 = {
    "status":"UNPLACED",
    "id":"123",
    "exchangeId":null,
    "price":"34420",
    "size":"0.01",
    "operation":"BUY",
    "fee":null,
    "feeCurrency":null,
    "fillPrice":null,
    "fillSize":null,
    "pair":"BTC-USDT",
    "instrument":"SPOT",
    "executeBefore":"2500-12-31T01:46:04.868Z",
    "executedAt":null,
    "createdAt":"2021-06-28T01:45:54.000Z",
    "updatedAt":"2021-06-28T01:45:54.000Z"
}

const mockedTrade2 = {
    "status":"UNPLACED",
    "id":"123",
    "exchangeId":null,
    "price":"34420",
    "size":"0.01",
    "operation":"BUY",
    "fee":null,
    "feeCurrency":null,
    "fillPrice":null,
    "fillSize":null,
    "pair":"BTC-USDT",
    "instrument":"SPOT",
    "executeBefore":"2500-12-31T01:46:04.868Z",
    "executedAt":null,
    "createdAt":"2021-06-28T01:45:54.000Z",
    "updatedAt":"2021-06-28T01:45:54.000Z"
}

const mockedTrade3 = {
    "status":"UNPLACED",
    "id":"123",
    "exchangeId":null,
    "price":"34420",
    "size":"0.01",
    "operation":"BUY",
    "fee":null,
    "feeCurrency":null,
    "fillPrice":null,
    "fillSize":null,
    "pair":"BTC-USDT",
    "instrument":"SPOT",
    "executeBefore":"2500-12-31T01:46:04.868Z",
    "executedAt":null,
    "createdAt":"2021-06-28T01:45:54.000Z",
    "updatedAt":"2021-06-28T01:45:54.000Z"
}

const mockedPendingTrade = {
    "status":"PENDING",
    "id":"123",
    "exchangeId":null,
    "price":"34420",
    "size":"0.01",
    "operation":"BUY",
    "fee":null,
    "feeCurrency":null,
    "fillPrice":null,
    "fillSize":null,
    "pair":"BTC-USDT",
    "instrument":"SPOT",
    "executeBefore":"2500-12-31T01:46:04.868Z",
    "executedAt":null,
    "createdAt":"2021-06-28T01:45:54.000Z",
    "updatedAt":"2021-06-28T01:45:54.000Z"
}

const mockedExpiredTrade = {
    "status":"PENDING",
    "id":"123",
    "exchangeId":null,
    "price":"34420",
    "size":"0.01",
    "operation":"BUY",
    "fee":null,
    "feeCurrency":null,
    "fillPrice":null,
    "fillSize":null,
    "pair":"BTC-USDT",
    "instrument":"SPOT",
    "executeBefore":"2021-06-28T01:45:54.000Z",
    "executedAt":null,
    "createdAt":"2021-06-28T01:45:54.000Z",
    "updatedAt":"2021-06-28T01:45:54.000Z"
}

jest.mock('sequelize', () => {
    const mSequelize = {
      authenticate: jest.fn(),
      define: jest.fn(() => {return {
          findByPk: (pk) => {
              switch(pk){
                  case '123': return mockedTrade1
                  case '1234': return mockedPendingTrade
                  case '12345': return mockedExpiredTrade
                  case '123456': return mockedTrade2
                  case '1234567': return mockedTrade3
                  default: return {}
              }
          },
          upsert: jest.fn()
      }})
    };
    const actualSequelize = jest.requireActual('sequelize');
    return { Sequelize: jest.fn(() => mSequelize), DataTypes: actualSequelize.DataTypes };
})

describe('Execute trade', () => {
    it('Should respond to Execute Trade succesfully with a trade object', async() => {
        mocked(axios.default)
        .mockResolvedValueOnce({data:{data:[{ts: "1624924078"}]}} as axios.AxiosResponse)
        .mockResolvedValueOnce({data:{data:[{sCode:"0",ordId:"123456"}]}} as axios.AxiosResponse)
        const result = await request(server).post('/trade/123');
        expect(result.statusCode).toEqual(200);
    });
    it('Should respond to Execute Trade with bad request because order is not executable because it is already placed', async() => {
        const result = await request(server).post('/trade/1234');
        expect(result.statusCode).toEqual(400);
    });
    it('Should respond to Execute Trade with bad request because order is not executable because it has expired', async() => {
        const result = await request(server).post('/trade/12345');
        expect(result.statusCode).toEqual(400);
    });
    it('Should respond with internal server error due to api failure', async() => {
        mocked(axios.default)
        .mockResolvedValueOnce({data:{data:[{ts: "1624924078"}]}} as axios.AxiosResponse)
        .mockResolvedValueOnce({data:{data:[{sCode:"1",sMsg:"Insufficient funds",ordId:"123456"}]}} as axios.AxiosResponse)
        const result = await request(server).post('/trade/123456');
        expect(result.statusCode).toEqual(500);
    })
    it('Should respond with internal server error due to axios failure', async() => {
        mocked(axios.default)
        .mockResolvedValueOnce({data:{data:[{ts: "1624924078"}]}} as axios.AxiosResponse)
        .mockImplementationOnce(() => {throw {
            data: {
                code: 500,
                msg: "Error while doing something.."
            },
            status: 500,
        }})
        const result = await request(server).post('/trade/1234567');
        expect(result.statusCode).toEqual(500);
    })
});
