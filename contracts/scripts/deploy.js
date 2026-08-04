// Script de despliegue de PointLedger en Arbitrum Sepolia.
// Uso: npm run deploy:arbitrumSepolia
// Requiere un archivo `.env` con PRIVATE_KEY (nunca commiteado).
// Opcional: ADMIN_VERIFIER_ADDRESS para autorizar la wallet del panel admin.

const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer:', deployer.address);
  console.log('Balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  const PointLedger = await hre.ethers.getContractFactory('PointLedger');
  const ledger = await PointLedger.deploy();
  const deployReceipt = await ledger.waitForDeployment();
  const address = await ledger.getAddress();

  console.log('PointLedger desplegado en:', address);
  console.log('Hash de despliegue:', deployReceipt.deploymentTransaction().hash);
  console.log('Propietario:', await ledger.owner());

  // Autorizar la wallet verificadora (panel admin) si se proporcionó.
  const verifierAddress = process.env.ADMIN_VERIFIER_ADDRESS?.trim();
  if (verifierAddress) {
    console.log('Autorizando verificador:', verifierAddress);
    const authTx = await ledger.authorizeVerifier(verifierAddress);
    const authReceipt = await authTx.wait();
    console.log('Hash de autorización:', authReceipt.hash);

    const isVerifier = await ledger.verifiers(verifierAddress);
    if (!isVerifier) {
      throw new Error(`La wallet ${verifierAddress} NO quedó autorizada como verificador.`);
    }
    console.log('Confirmado: verificador autorizado =', isVerifier);
  } else {
    console.log('ADMIN_VERIFIER_ADDRESS no definido: se omite la autorización de verificador.');
  }

  return { address, deployReceipt, verifierAddress };
}

main()
  .then(({ address }) => {
    console.log('Dirección final:', address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });