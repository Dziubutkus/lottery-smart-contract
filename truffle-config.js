//const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*', // eslint-disable-line camelcase
    },
    /*
    ganache: {
      host: 'localhost',
      port: 7545,
      network_id: '*', // eslint-disable-line camelcase
    },
    rinkeby: {
      provider: () => new HDWalletProvider('dziugo walletas', "https://rinkeby.infura.io/507b091b9fc14b08ae4bdc6d05b89ebc"),
      network_id: "4"
    },
    */
  },
};