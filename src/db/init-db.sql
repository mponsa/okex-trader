create database trader;

create table trader.trades (
    id VARCHAR(36) PRIMARY KEY NOT NULL,
    status VARCHAR(30),
    exchangeId VARCHAR(60),
    price VARCHAR(60),
    size VARCHAR(60),
    operation VARCHAR(60),
    fee VARCHAR(60),
    feeCurrency VARCHAR(60),
    fillPrice VARCHAR(60),
    fillSize VARCHAR(60),
    pair VARCHAR(60),
    instrument VARCHAR(60),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    executeBefore VARCHAR(60),
    executedAt VARCHAR(60)
);
