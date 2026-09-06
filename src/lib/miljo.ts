/**
 * Läser en miljövariabel, oavsett var körtiden lagt den.
 *
 * I Node står allt i `process.env`. I Cloudflare Workers finns värdena i
 * stället som bindningar på det `env` som skickas med varje förfrågan.
 * OpenNext kopierar dem till `process.env` första gången en förfrågan
 * kommer in – men det är en kopia, gjord av kod som måste ha hunnit köra,
 * i just det isolat som körde den. Bindningen är källan.
 *
 * Att läsa källan när kopian är tom kostar ingenting och tar bort en hel
 * klass av fel som ser ut som "hemligheten är inte satt" fast den är det.
 */

/** Nyckeln OpenNext lägger förfrågans Cloudflare-sammanhang under. */
const SAMMANHANG = Symbol.for("__cloudflare-context__");

type Sammanhang = { env?: Record<string, unknown> };

/** Bindningarna för den pågående förfrågan, eller undefined i Node. */
function bindningar(): Record<string, unknown> | undefined {
  const bararen = globalThis as unknown as Record<symbol, unknown>;
  const sammanhang = bararen[SAMMANHANG] as Sammanhang | undefined;
  return sammanhang?.env;
}

export function miljo(namn: string): string | undefined {
  const kopian = process.env[namn];
  if (kopian !== undefined) return kopian;

  const varde = bindningar()?.[namn];
  return typeof varde === "string" ? varde : undefined;
}

/**
 * Hur många värden var och en av de två källorna har.
 *
 * Bara för `/api/halsa`, och bara antal – aldrig namn eller innehåll. Är
 * `bindningar` noll når hemligheterna inte Workern alls, och då är det
 * driftsättningen som är fel. Är `bindningar` fler än noll medan
 * `process.env` är tom, är det kopieringen som inte skett.
 */
export function miljoantal() {
  const fran_bindningar = bindningar();
  return {
    variabler: Object.keys(process.env).length,
    bindningar: fran_bindningar ? Object.keys(fran_bindningar).length : null,
  };
}
