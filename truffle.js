module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8845,
      network_id: "8045",
	  gas: 6712388,
	  gasPrice: 65000000000
    }
  },
  solc: {
  	optimizer: {
  		enabled: true,
  		runs: 200
  	}
  }
};