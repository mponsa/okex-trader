import * as dotenv from 'dotenv';
import { DefaultOkexRepository} from '../repositories/okex';
import { DefaultTradeRepository } from '../repositories/trade';
import { DefaultTraderService } from '../services/trader';
import { TraderController } from '../controllers/trader';
dotenv.config()

const okexRepository = new DefaultOkexRepository(process.env.API_KEY || '',process.env.SECRET_KEY || '',process.env.PASS || '')
const tradeRepository = new DefaultTradeRepository();
const traderService = new DefaultTraderService(okexRepository,tradeRepository);
const traderController = new TraderController(traderService);

export const container = {
    traderController
}
