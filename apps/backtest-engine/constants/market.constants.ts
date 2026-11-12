// Délai maximal d'une réponse de market-service : le fournisseur peut mettre du temps sur une longue période ou plusieurs symboles
export const MARKET_SERVICE_TIMEOUT_MS = 60_000;

// Statuts de market-service qui justifient une seconde tentative (indisponible, passerelle, délai) ; un 500 (symbole inconnu) n'en justifie pas
export const RETRYABLE_STATUSES = [502, 503, 504];
