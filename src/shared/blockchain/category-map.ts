// PointLedger (contracts/contracts/PointLedger.sol › pointsForCategory) solo reconoce tres
// categorías y revierte con UnknownCategory ante cualquier otra. La app maneja nueve, así que
// cada una se agrupa en la categoría on-chain de naturaleza más cercana (sin redeploy).
//
// | Categoría app            | Pts app | Categoría on-chain | Pts on-chain |
// |--------------------------|---------|--------------------|--------------|
// | pesca_ilegal             | 100     | pesca_ilegal       | 100          |
// | embarcacion_sospechosa   | 40      | pesca_ilegal       | 100          |
// | basura_marina            | 50      | basura_marina      | 50           |
// | derrame_hidrocarburos    | 100     | basura_marina      | 50           |
// | redes_fantasmas          | 50      | basura_marina      | 50           |
// | variacion_mar            | 30      | variacion_mar      | 30           |
// | marea_roja               | 40      | variacion_mar      | 30           |
// | fauna_herida             | 60      | variacion_mar      | 30           |
// | otro                     | 30      | variacion_mar      | 30           |
//
// Los puntos canjeables los define Firestore (REPORT_CATEGORIES); el ledger on-chain registra
// la categoría agrupada con su puntaje fijo para auditoría pública.

export type OnChainCategory = 'pesca_ilegal' | 'basura_marina' | 'variacion_mar';

export const ON_CHAIN_POINTS: Record<OnChainCategory, number> = {
  pesca_ilegal: 100,
  basura_marina: 50,
  variacion_mar: 30,
};

export const ON_CHAIN_CATEGORY_MAP: Record<string, OnChainCategory> = {
  pesca_ilegal: 'pesca_ilegal',
  embarcacion_sospechosa: 'pesca_ilegal',
  basura_marina: 'basura_marina',
  derrame_hidrocarburos: 'basura_marina',
  redes_fantasmas: 'basura_marina',
  variacion_mar: 'variacion_mar',
  marea_roja: 'variacion_mar',
  fauna_herida: 'variacion_mar',
  otro: 'variacion_mar',
};

export function toOnChainCategory(category: string): OnChainCategory {
  const mapped = ON_CHAIN_CATEGORY_MAP[category];
  if (!mapped) {
    throw new Error(`Categoría sin equivalente on-chain: ${category}`);
  }
  return mapped;
}
