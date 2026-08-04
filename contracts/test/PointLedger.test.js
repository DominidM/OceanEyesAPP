const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

describe('PointLedger', function () {
  let PointLedger;
  let ledger;
  let owner;
  let verifier;
  let attacker;
  let reporter;

  const CATEGORIES = [
    { name: 'pesca_ilegal', points: 100 },
    { name: 'basura_marina', points: 50 },
    { name: 'variacion_mar', points: 30 },
  ];

  beforeEach(async function () {
    [owner, verifier, attacker, reporter] = await ethers.getSigners();
    PointLedger = await ethers.getContractFactory('PointLedger');
    ledger = await PointLedger.deploy();
    await ledger.waitForDeployment();
  });

  describe('Despliegue', function () {
    it('1. El deployer queda configurado como propietario', async function () {
      expect(await ledger.owner()).to.equal(owner.address);
    });
  });

  describe('Gestión de verificadores', function () {
    it('2. El propietario puede autorizar un verificador', async function () {
      await expect(ledger.authorizeVerifier(verifier.address))
        .to.emit(ledger, 'VerifierAuthorized')
        .withArgs(verifier.address);
      expect(await ledger.verifiers(verifier.address)).to.equal(true);
    });

    it('3. El propietario puede revocar un verificador', async function () {
      await ledger.authorizeVerifier(verifier.address);
      await expect(ledger.revokeVerifier(verifier.address))
        .to.emit(ledger, 'VerifierRevoked')
        .withArgs(verifier.address);
      expect(await ledger.verifiers(verifier.address)).to.equal(false);
    });

    it('14. Una cuenta distinta del propietario no puede administrar verificadores', async function () {
      await expect(ledger.connect(attacker).authorizeVerifier(verifier.address))
        .to.be.revertedWithCustomError(ledger, 'OwnableUnauthorizedAccount')
        .withArgs(attacker.address);
      await ledger.authorizeVerifier(verifier.address);
      await expect(ledger.connect(attacker).revokeVerifier(verifier.address))
        .to.be.revertedWithCustomError(ledger, 'OwnableUnauthorizedAccount')
        .withArgs(attacker.address);
    });

    it('Rechaza autorizar la dirección cero como verificador', async function () {
      await expect(ledger.authorizeVerifier(ethers.ZeroAddress)).to.be.revertedWith(
        'PointLedger: verifier is zero address',
      );
    });
  });

  describe('Otorgamiento de puntos', function () {
    beforeEach(async function () {
      await ledger.authorizeVerifier(verifier.address);
    });

    it('4. Una cuenta no autorizada no puede otorgar puntos', async function () {
      await expect(
        ledger.connect(attacker).awardPoints(reporter.address, 'report-1', 'pesca_ilegal'),
      ).to.be.revertedWith('PointLedger: not an authorized verifier');
    });

    it('5. Un verificador autorizado puede otorgar puntos', async function () {
      await expect(ledger.connect(verifier).awardPoints(reporter.address, 'report-1', 'pesca_ilegal'))
        .to.emit(ledger, 'PointsAwarded')
        .withArgs(reporter.address, verifier.address, 100, 'pesca_ilegal', 'report-1', anyValue);
    });

    CATEGORIES.forEach(({ name, points }) => {
      it(`6. ${name} entrega ${points} puntos`, async function () {
        await ledger.connect(verifier).awardPoints(reporter.address, `report-${name}`, name);
        expect(await ledger.getBalance(reporter.address)).to.equal(points);
      });
    });

    it('7. Una categoría inválida es rechazada', async function () {
      await expect(
        ledger.connect(verifier).awardPoints(reporter.address, 'report-1', 'categoria_falsa'),
      ).to.be.revertedWithCustomError(ledger, 'UnknownCategory');
    });

    it('8. La dirección cero es rechazada como reportante', async function () {
      await expect(
        ledger.connect(verifier).awardPoints(ethers.ZeroAddress, 'report-1', 'pesca_ilegal'),
      ).to.be.revertedWithCustomError(ledger, 'ZeroReporter');
    });

    it('9. Un reportId vacío es rechazado', async function () {
      await expect(
        ledger.connect(verifier).awardPoints(reporter.address, '', 'pesca_ilegal'),
      ).to.be.revertedWithCustomError(ledger, 'EmptyReportId');
    });

    it('10. Un mismo reporte no puede procesarse dos veces', async function () {
      await ledger.connect(verifier).awardPoints(reporter.address, 'report-1', 'pesca_ilegal');
      await expect(
        ledger.connect(verifier).awardPoints(reporter.address, 'report-1', 'pesca_ilegal'),
      ).to.be.revertedWithCustomError(ledger, 'AlreadyProcessed');
    });

    it('11. Los puntos se acumulan correctamente por usuario', async function () {
      await ledger.connect(verifier).awardPoints(reporter.address, 'r-1', 'pesca_ilegal'); // 100
      await ledger.connect(verifier).awardPoints(reporter.address, 'r-2', 'basura_marina'); // 50
      await ledger.connect(verifier).awardPoints(reporter.address, 'r-3', 'variacion_mar'); // 30
      expect(await ledger.getBalance(reporter.address)).to.equal(180);
    });
  });

  describe('Registro y consultas', function () {
    beforeEach(async function () {
      await ledger.authorizeVerifier(verifier.address);
      await ledger.connect(verifier).awardPoints(reporter.address, 'report-1', 'pesca_ilegal');
    });

    it('12. El registro guardado contiene los valores correctos', async function () {
      const tx = await ledger.getTransaction(0);
      expect(tx.reporter).to.equal(reporter.address);
      expect(tx.verifier).to.equal(verifier.address);
      expect(tx.points).to.equal(100);
      expect(tx.category).to.equal('pesca_ilegal');
      expect(tx.reportId).to.equal('report-1');
      expect(tx.timestamp).to.be.greaterThan(0);
    });

    it('Expone la cantidad de transacciones', async function () {
      expect(await ledger.getTransactionCount()).to.equal(1);
    });

    it('Permite saber si un reporte ya fue procesado', async function () {
      expect(await ledger.isReportProcessed('report-1')).to.equal(true);
      expect(await ledger.isReportProcessed('report-inexistente')).to.equal(false);
    });

    it('13. Emite el evento PointsAwarded con los datos esperados', async function () {
      await expect(ledger.connect(verifier).awardPoints(reporter.address, 'report-2', 'basura_marina'))
        .to.emit(ledger, 'PointsAwarded')
        .withArgs(reporter.address, verifier.address, 50, 'basura_marina', 'report-2', anyValue);
    });

    it('Rechaza consultar una transacción inexistente', async function () {
      await expect(ledger.getTransaction(99)).to.be.revertedWithPanic();
    });
  });
});