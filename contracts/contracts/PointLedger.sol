// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

/// @title PointLedger
/// @notice Registro auditable e inmutable de puntos otorgados por reportes
///         ambientales verificados en OceanEyes. No es un token ERC-20: solo
///         acumula puntos por reportante para auditoría pública.
/// @dev Solo verificadores autorizados (por el propietario) pueden otorgar
///      puntos. Un mismo reportId no puede procesarse dos veces.
contract PointLedger is Ownable {
    struct Transaction {
        address reporter;
        address verifier;
        uint256 points;
        string category;
        string reportId;
        uint256 timestamp;
    }

    /// @dev Datos del award asociado a un reportId (para poder revocar).
    struct Award {
        address reporter;
        uint256 points;
    }

    /// @dev wallet autorizada que puede otorgar puntos.
    mapping(address => bool) public verifiers;

    /// @dev reportId ya procesado (clave idempotente).
    mapping(bytes32 => bool) private processedReports;

    /// @dev award vigente por reportId (puede quedar vacío tras revocar).
    mapping(bytes32 => Award) private awards;

    /// @dev reportId cuyo award fue revocado (nunca se elimina del historial).
    mapping(bytes32 => bool) public revokedReports;

    /// @dev Puntos acumulados por wallet de reportante.
    mapping(address => uint256) private balances;

    Transaction[] private transactions;

    event PointsAwarded(
        address indexed reporter,
        address indexed verifier,
        uint256 points,
        string category,
        string reportId,
        uint256 timestamp
    );

    event VerifierAuthorized(address indexed verifier);

    event VerifierRevoked(address indexed verifier);

    event PointsRevoked(
        address indexed reporter,
        address indexed revoker,
        uint256 points,
        string reportId,
        uint256 timestamp
    );

    error ZeroReporter();
    error EmptyReportId();
    error UnknownCategory();
    error AlreadyProcessed();
    error NotProcessed();
    error AlreadyRevoked();

    constructor() Ownable(msg.sender) {}

    modifier onlyVerifier() {
        require(verifiers[msg.sender], 'PointLedger: not an authorized verifier');
        _;
    }

    /// @notice Autoriza a un verificador para otorgar puntos. Solo el propietario.
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), 'PointLedger: verifier is zero address');
        verifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }

    /// @notice Revoca a un verificador. Solo el propietario.
    function revokeVerifier(address verifier) external onlyOwner {
        require(verifiers[verifier], 'PointLedger: verifier not authorized');
        verifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }

    /// @notice Registra puntos on-chain para un reporte verificado.
    /// @dev Solo un verificador autorizado. El `msg.sender` queda como verificador.
    function awardPoints(address reporter, string calldata reportId, string calldata category) external onlyVerifier {
        if (reporter == address(0)) revert ZeroReporter();
        if (bytes(reportId).length == 0) revert EmptyReportId();

        uint256 points = pointsForCategory(category);
        if (points == 0) revert UnknownCategory();

        bytes32 reportKey = keccak256(bytes(reportId));
        if (processedReports[reportKey]) revert AlreadyProcessed();
        processedReports[reportKey] = true;
        awards[reportKey] = Award({ reporter: reporter, points: points });

        balances[reporter] += points;

        transactions.push(
            Transaction({
                reporter: reporter,
                verifier: msg.sender,
                points: points,
                category: category,
                reportId: reportId,
                timestamp: block.timestamp
            })
        );

        emit PointsAwarded(reporter, msg.sender, points, category, reportId, block.timestamp);
    }

    /// @notice Revoca los puntos de un reporte verificado que resultó falso.
    /// @dev Solo el propietario (corrección sensible). El historial de la
    ///      transacción permanece intacto (ledger inmutable); solo se corrige el
    ///      estado actual: se resta del balance y se marca el reportId como
    ///      revocado. Un reporte revocado no puede volver a otorgarse.
    function revokePoints(string calldata reportId) external onlyOwner {
        if (bytes(reportId).length == 0) revert EmptyReportId();

        bytes32 reportKey = keccak256(bytes(reportId));
        Award memory award = awards[reportKey];
        if (award.reporter == address(0)) revert NotProcessed();
        if (revokedReports[reportKey]) revert AlreadyRevoked();

        revokedReports[reportKey] = true;
        balances[award.reporter] -= award.points;

        emit PointsRevoked(award.reporter, msg.sender, award.points, reportId, block.timestamp);
    }

    /// @notice Devuelve los puntos acumulados on-chain para una wallet.
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /// @notice Informa si un reportId ya fue procesado.
    function isReportProcessed(string calldata reportId) external view returns (bool) {
        return processedReports[keccak256(bytes(reportId))];
    }

    /// @notice Informa si el award de un reportId fue revocado.
    function isReportRevoked(string calldata reportId) external view returns (bool) {
        return revokedReports[keccak256(bytes(reportId))];
    }

    /// @notice Cantidad de transacciones registradas.
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /// @notice Transacción por índice.
    function getTransaction(uint256 index) external view returns (Transaction memory) {
        return transactions[index];
    }

    function pointsForCategory(string memory category) public pure returns (uint256) {
        if (keccak256(bytes(category)) == keccak256(bytes('pesca_ilegal'))) return 100;
        if (keccak256(bytes(category)) == keccak256(bytes('basura_marina'))) return 50;
        if (keccak256(bytes(category)) == keccak256(bytes('variacion_mar'))) return 30;
        return 0;
    }
}