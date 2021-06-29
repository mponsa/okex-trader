jest.mock('sequelize');
jest.mock('axios');

import request from 'supertest'
import { server } from '../src/app'


describe('Demo test', () => {
  it('should respond to ping', async() => {
    const result = await request(server).get('/ping')
    expect(result.text).toEqual('pong');
    expect(result.statusCode).toEqual(200);
  });
});
