/**
 * Urvalet till "Viktiga notiser" på startsidan. Ren logik utan databas, så
 * att den går att prova: felet den rättar var osynligt – listan klipptes
 * osorterad, och fyra certifikat i varningsfönstret trängde undan både
 * uppföljningar och olästa meddelanden.
 */

export type Notis = {
  id: string;
  text: string;
  href: string;
  urgent: boolean;
  at: Date;
  /**
   * Tid kvar till åtgärd i millisekunder: negativ för något som passerat,
   * noll för sådant som ligger och väntar nu.
   */
  ordning: number;
};

/** Mest brådskande först: utgånget före väntande före kommande. */
export function sorteraNotiser<T extends { urgent: boolean; ordning: number }>(
  rader: T[],
) {
  return [...rader].sort(
    (a, b) => Number(b.urgent) - Number(a.urgent) || a.ordning - b.ordning,
  );
}

/**
 * Plockar `take` notiser, varannan från varje kö, så att en sorts notis
 * aldrig fyller listan helt när det finns annat att visa.
 */
export function valjNotiser<T extends { urgent: boolean; ordning: number }>(
  koer: T[][],
  take: number,
) {
  const sorterade = koer.map(sorteraNotiser);
  const valda: T[] = [];
  for (let i = 0; valda.length < take && sorterade.some((k) => k[i]); i += 1) {
    for (const ko of sorterade) {
      const rad = ko[i];
      if (rad && valda.length < take) valda.push(rad);
    }
  }
  return sorteraNotiser(valda);
}
