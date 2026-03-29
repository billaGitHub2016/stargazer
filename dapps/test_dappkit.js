const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');
const client = new SuiClient({ url: getFullnodeUrl('testnet') });
console.log(client);
