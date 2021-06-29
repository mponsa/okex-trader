import request from 'supertest'
import { server } from '../src/app'
import * as axios from 'axios';
import { mocked } from 'ts-jest/utils'
jest.mock('axios');


const orderBookSucesssMock = require('./mocks/OrderBookBTC-USDTSuccessResponse.json');

jest.mock('sequelize', () => {
    const mSequelize = {
      authenticate: jest.fn(),
      define: jest.fn(() =>{return {
          create: jest.fn()
      }}),
    };
    
    return { Sequelize: jest.fn(() => mSequelize)};
});

describe('Get best Trade Test', () => {
    it('Should respond to GET TRADE succesfully with a trade object', async() => {
        mocked(axios.default).mockResolvedValue(orderBookSucesssMock);
        const result = await request(server).get('/trade?pair=BTC-USDT&operation=BUY&size=0.01');
        expect(JSON.parse(result.text).operation).toEqual('BUY');
        expect(JSON.parse(result.text).pair).toEqual("BTC-USDT");
        expect(JSON.parse(result.text).price).toEqual("34386.7");
        expect(result.statusCode).toEqual(200);
    });

    it('Should respond to GET TRADE succesfully with a trade object', async() => {
        mocked(axios.default).mockResolvedValue(orderBookSucesssMock);
        const result = await request(server).get('/trade?pair=BTC-USDT&operation=SELL&size=0.01');
        expect(JSON.parse(result.text).operation).toEqual('SELL');
        expect(JSON.parse(result.text).pair).toEqual("BTC-USDT");
        expect(JSON.parse(result.text).price).toEqual("34530.1029002");
        expect(result.statusCode).toEqual(200);
    });

    it('Should fail due to missing parameters in request', async () => {
        const result = await request(server).get('/trade?operation=BUY&size=0.01')
        expect(result.statusCode).toEqual(400);
    })

    it('Should fail due to client error', async() => {
        mocked(axios.default).mockImplementation(() => {throw {
            response: {
                data: {
                    code: 500,
                    msg: "Error while doing something.."
                },
                status: 500,
            }
        }})
        const result = await request(server).get('/trade?pair=BTC-USDT&operation=BUY&size=0.01')
        expect(result.statusCode).toEqual(500);
        expect(JSON.parse(result.text).msg).toEqual("Client failed error code: 500: Error while doing something..");
    });
});
