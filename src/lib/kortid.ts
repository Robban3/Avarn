/**
 * Vilken körtid appen står i.
 *
 * Appen körs på två ställen: i Node (utveckling, `next start`, Vercel) och i
 * en Cloudflare Worker. Det mesta är sig likt, men tre saker skiljer:
 * anslutningar får inte sparas mellan förfrågningar, det finns inget
 * filsystem, och wasm laddas bara som importerad modul.
 *
 * Workers anger sig själv i `navigator.userAgent`, och gör det redan när
 * modulerna laddas – därför kan värdet räknas ut en gång och läsas som en
 * konstant. `typeof`-kontrollen behövs för Node, där `navigator` saknas i
 * äldre körtider.
 */
export const iWorkers =
  typeof navigator !== "undefined" &&
  navigator.userAgent === "Cloudflare-Workers";
