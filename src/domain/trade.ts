import * as Sequelize from 'sequelize'
import { sequelize } from "../db";

export interface TradeViewModel {
    status: string;
    id: string;
    exchangeId: string | null;
    price: string;
    size: string;
    operation: string;
    fee: string | null;
    feeCurrency: string | null;
    fillPrice: string | null;
    fillSize: string | null;
    pair: string;
    instrument: string;
    executeBefore: string;
    executedAt: string | null;
}

export interface TradeModel extends Sequelize.Model<TradeModel, TradeViewModel>{
    status: string;
    id: string;
    exchangeId: string | null;
    price: string;
    size: string;
    operation: string;
    fee: string | null;
    feeCurrency: string | null;
    fillPrice: string | null;
    fillSize: string | null;
    pair: string;
    instrument: string;
    createdAt: string;
    updatedAt:  string;
    executeBefore: string;
    executedAt: string | null;
}

export const Trade = sequelize.define<TradeModel,TradeViewModel>('trade',{
    status: Sequelize.STRING,
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    exchangeId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    price: Sequelize.STRING,
    size:  Sequelize.STRING,
    operation:  Sequelize.STRING,
    fee: {
        type: Sequelize.STRING,
        allowNull: true
    },
    feeCurrency: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fillPrice: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fillSize: {
        type: Sequelize.STRING,
        allowNull: true
    },
    pair: Sequelize.STRING,
    instrument: Sequelize.STRING,
    executeBefore: Sequelize.STRING,
    executedAt: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

