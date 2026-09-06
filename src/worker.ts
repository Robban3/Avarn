/**
 * Workerns ingång.
 *
 * OpenNext bygger `.open-next/worker.js`, som svarar på förfrågningar och
 * importeras här under namnet `open-next-worker`. Den har ingen
 * `scheduled`-hanterare, och utan en sådan har ett cron-schema i
 * wrangler.jsonc ingenstans att ta vägen – Cloudflare kör det ändå och
 * loggar ett fel varje natt.
 *
 * Därför den här filen: den lägger till schemaläggningen och lämnar
 * förfrågningarna orörda. `wrangler.jsonc` pekar på den i stället för på
 * OpenNexts fil.
 */

import next from "open-next-worker";

// Namngivna exporter (OpenNext lägger sina Durable Objects där när en cache
// är konfigurerad) måste följa med, annars hittar Cloudflare inte klasserna.
export * from "open-next-worker";

type Miljo = Record<string, string | undefined>;
type Kontext = { waitUntil(uppgift: Promise<unknown>): void };

/**
 * Certifikatpåminnelserna.
 *
 * Rutten `/api/cron/paminnelser` är samma väg en manuell körning tar, så
 * det finns bara en beskrivning av vad en påminnelse är. Anropet går rakt
 * in i samma Worker – ingen förfrågan lämnar Cloudflare – och nyckeln
 * skickas i `x-cron-key`, precis som rutten väntar sig.
 *
 * Värdnamnet spelar ingen roll för routningen, men adressen måste gå att
 * tolka, så den får ett eget som aldrig kan förväxlas med en riktig träff
 * i loggen.
 */
async function korPaminnelser(miljo: Miljo, kontext: Kontext) {
  const nyckel = miljo.CRON_KEY;
  if (!nyckel) {
    console.error("CRON_KEY saknas – påminnelserna kördes inte.");
    return;
  }

  const svar = await next.fetch(
    new Request("https://schemalagt.avarn.internal/api/cron/paminnelser", {
      method: "POST",
      headers: { "x-cron-key": nyckel },
    }),
    miljo,
    kontext,
  );

  if (!svar.ok) {
    console.error(`Påminnelserna svarade ${svar.status}: ${await svar.text()}`);
    return;
  }
  console.log(`Påminnelserna kördes: ${await svar.text()}`);
}

// Spridningen tar med det OpenNext redan har – i dag bara fetch, men allt
// som tillkommer följer med av sig själv i stället för att tyst falla bort.
const hanterare = {
  ...next,
  fetch: (forfragan: Request, miljo: Miljo, kontext: Kontext) =>
    next.fetch(forfragan, miljo, kontext),
  scheduled(_handelse: unknown, miljo: Miljo, kontext: Kontext) {
    kontext.waitUntil(korPaminnelser(miljo, kontext));
  },
};

export default hanterare;
