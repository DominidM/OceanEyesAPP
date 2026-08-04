// Smoke test del flujo de despliegue + operación, sobre la red local de Hardhat.
// Uso: npx hardhat test test/smoke.test.js  (o incluido en npm test)

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PointLedger — Smoke test de despliegue local', function () {
  it('Despliega, autoriza verificador, otorga puntos y consulta', async function () {
    const [owner, verifier, reporter] = await ethers.getSigners();

    const PointLedger = await ethers.getContractFactory('PointLedger');
    const ledger = await PointLedger.deploy();
    const deployReceipt = await ledger.waitForDeployment();
    const address = await ledger.getAddress();

    // 1. Despliegue + propietario
    expect(deployReceipt.deploymentTransaction().hash).to.match(/^0x[0-9a-f]{64}$/);
    expect(address).to.match(/^0x[0-9a-fA-F]{40}$/);
    expect(await ledger.owner()).to.equal(owner.address);

    // 2. Autorizar verificador y confirmar con isVerifier()
    const authTx = await ledger.authorizeVerifier(verifier.address);
    await authTx.wait();
    expect(await ledger.verifiers(verifier.address)).to.equal(true);

    // 3. Otorgar puntos a un usuario
    const awardTx = await ledger.connect(verifier).awardPoints(reporter.address, 'report-smoke', 'pesca_ilegal');
    await awardTx.wait();

    // 4. Consultar balance y estado del reporte
    expect(await ledger.getBalance(reporter.address)).to.equal(100);
    expect(await ledger.isReportProcessed('report-smoke')).to.equal(true);
    expect(await ledger.getTransactionCount()).to.equal(1);

    const record = await ledger.getTransaction(0);
    expect(record.reporter).to.equal(reporter.address);
    expect(record.points).to.equal(100);
  });
});