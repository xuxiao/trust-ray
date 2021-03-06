import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";
import { Transaction } from "../models/TransactionModel";
import { TransactionOperation } from "../models/TransactionOperationModel";
import { ERC20Contract } from "../models/Erc20ContractModel";
import { LastParsedBlock } from "../models/LastParsedBlockModel";
import { Config } from "../common/Config";
import * as winston from "winston";

const config = require("config");
const packageJSON = require("../../package.json");

export class StatusController {

    public getStatus(req: Request, res: Response) {
        Promise.all([
            Transaction.count(),
            TransactionOperation.count(),
            ERC20Contract.count(),
            LastParsedBlock.findOne(),
            Config.web3.eth.getBlockNumber(),
            Config.web3.eth.net.getId()
        ]).then(([transactionsCount, operationsCount, erc20contractsCount, lastParsedBlock, latestBlockNumberInBC, networkId]) => {
            const latestBlockNumberInDB = lastParsedBlock.lastBlock;
            const blocksToSync = latestBlockNumberInBC - latestBlockNumberInDB;

            const latestBackwordBlockNumberInDB = lastParsedBlock.lastBackwardBlock;
            const blocksToSyncBackward = latestBackwordBlockNumberInDB;

            sendJSONresponse(res, 200, {
                database: {
                    transactions: parseInt(transactionsCount).toLocaleString(),
                    transaction_operations: parseInt(operationsCount).toLocaleString(),
                    erc20contracts: parseInt(erc20contractsCount).toLocaleString(),
                },
                parsing: {
                    latestBlockNumberInBC,
                    latestBlockNumberInDB,
                    latestBackwordBlockNumberInDB,
                    lastPusherBlock: lastParsedBlock.lastPusherBlock
                },
                sync: {
                    blocksToSync,
                    blocksToSyncBackward,
                },
                version: packageJSON.version,
                config: {
                    rpc_server: config.get("RPC_SERVER"),
                    network_id: networkId
                }
            });
        }).catch((err: Error) => {
            winston.error("Failed to load initial block state in getStatus: " + err);
            sendJSONresponse(res, 200, {error: err})
        });
    }
}