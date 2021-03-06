const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ERC20ContractScheme = new Schema({
    address :  {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    totalSupply: {
        type: String,
        required: true
    },
    decimals: {
        type: Number,
        required: true
    },
    symbol: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
});

// indices
ERC20ContractScheme.index({address: 1}, {name: "contractAddressIndex"});

export const ERC20Contract = mongoose.model("ERC20Contract", ERC20ContractScheme);