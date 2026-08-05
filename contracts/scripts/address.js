// Imprime SOLO la dirección pública del deployer derivada de PRIVATE_KEY en `.env`.
// No muestra la clave. Uso: npx hardhat run scripts/address.js --network arbitrumSepolia

require('dotenv').config();
const { Wallet } = require('ethers');

async function main() {
  const privateKey = process.env.PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error('PRIVATE_KEY no está definido en contracts/.env. Cópialo desde .env.example y complétalo.');
  }
  const wallet = new Wallet(privateKey);
  console.log('Dirección pública del deployer:', wallet.address);
  console.log('Fondea esta dirección con ETH de Sepolia en:');
  console.log('  https://www.alchemy.com/faucets/arbitrum-sepolia');
  console.log('  https://faucet.quicknode.com/arbitrum/sepolia');
  console.log('  (o el faucet oficial de Arbitrum)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });