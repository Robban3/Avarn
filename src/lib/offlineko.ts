/**
 * Kön över det som registrerats utan uppkoppling.
 *
 * Ligger i IndexedDB och inte hos servicearbetaren: den senare är en
 * cache av appens resurser och överlever inte att webbläsaren rensar
 * den, medan en markering en förare gjort i en bagagehall måste ligga
 * kvar tills den faktiskt kommit fram.
 *
 * Kön töms av Synkaren i src/components/Offline.tsx när uppkopplingen
 * kommer tillbaka. Här finns bara lagringen.
 */

const DATABAS = "avarn-offline";
const BUTIK = "ko";
const HANDELSE = "avarn:ko";

/**
 * Vilken server action posten ska skickas till när nätet är tillbaka.
 *
 * Alla tre sätter ett läge och räknar inte fram det ur det gamla, så att
 * en post som ligger kvar i kön tål att skickas om.
 */
export type Kotyp = "handelse" | "checklista" | "framdrift";

export type Kopost = {
  id?: number;
  typ: Kotyp;
  /** Formulärets fält, som de såg ut när föraren tryckte. */
  falt: [string, string][];
  skapad: number;
  /** Antal misslyckade försök att skicka posten. */
  forsok?: number;
};

/**
 * Så många gånger en post får misslyckas innan den hoppas över.
 *
 * Går den inte igenom så många gånger i rad är det inte nätet det
 * hänger på, och då ska den inte hålla kvar allt som ligger bakom.
 */
export const MAX_FORSOK = 5;

/** Antalet köade poster, som en synkron ögonblicksbild. */
let langd = 0;
let laddad = false;

function oppna(): Promise<IDBDatabase> {
  return new Promise((klar, fel) => {
    const begaran = indexedDB.open(DATABAS, 1);
    begaran.onupgradeneeded = () => {
      const databas = begaran.result;
      if (!databas.objectStoreNames.contains(BUTIK)) {
        databas.createObjectStore(BUTIK, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    begaran.onsuccess = () => klar(begaran.result);
    begaran.onerror = () => fel(begaran.error);
  });
}

function medButik<T>(
  lage: IDBTransactionMode,
  arbete: (butik: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return oppna().then(
    (databas) =>
      new Promise<T>((klar, fel) => {
        const transaktion = databas.transaction(BUTIK, lage);
        const begaran = arbete(transaktion.objectStore(BUTIK));
        begaran.onsuccess = () => klar(begaran.result);
        begaran.onerror = () => fel(begaran.error);
        transaktion.oncomplete = () => databas.close();
      }),
  );
}

/** Ropar ut att kön ändrats, så att statusraden ritas om. */
function meddela() {
  window.dispatchEvent(new Event(HANDELSE));
}

export async function laggIKo(post: Omit<Kopost, "id" | "skapad">) {
  // Räknaren höjs synkront, innan skrivningen till IndexedDB hunnit klart.
  //
  // Annars finns ett glapp mellan trycket och att kön känns vid posten: en
  // förare som bockar av något offline ser "registreringar sparas i
  // telefonen" utan siffra, och statusraden kan hinna säga att allt är
  // synkroniserat innan den ens vet att det ligger något nytt där. Ett
  // tryck som tagit ska räknas från samma ögonblick det tog.
  langd += 1;
  laddad = true;
  meddela();

  await medButik("readwrite", (butik) =>
    butik.add({ ...post, skapad: Date.now() }),
  );
  await raknaOm();
}

export async function hamtaKo(): Promise<Kopost[]> {
  const poster = await medButik<Kopost[]>("readonly", (butik) =>
    butik.getAll(),
  );
  // Äldst först: registreringarna ska komma fram i den ordning de gjordes.
  return poster.sort((a, b) => a.skapad - b.skapad);
}

/** Räknar upp misslyckade försök på en post. */
export async function raknaForsok(id: number) {
  const post = await medButik<Kopost | undefined>("readonly", (butik) =>
    butik.get(id),
  );
  if (!post) return;
  await medButik("readwrite", (butik) =>
    butik.put({ ...post, forsok: (post.forsok ?? 0) + 1 }),
  );
}

export async function taBortUrKo(id: number) {
  await medButik("readwrite", (butik) => butik.delete(id));
  await raknaOm();
}

export async function tomKon() {
  await medButik("readwrite", (butik) => butik.clear());
  await raknaOm();
}

async function raknaOm() {
  try {
    langd = await medButik<number>("readonly", (butik) => butik.count());
  } catch {
    langd = 0;
  }
  laddad = true;
  meddela();
}

/* ------------------------------------------- Ögonblicksbild för React */

export function prenumereraKo(vid: () => void) {
  window.addEventListener(HANDELSE, vid);
  // Första avläsningen sker här och inte i en effekt: IndexedDB är
  // asynkront, och ögonblicksbilden måste vara synkron.
  if (!laddad) void raknaOm();
  return () => window.removeEventListener(HANDELSE, vid);
}

export const koLangd = () => langd;

/** Servern har ingen kö; den känner inte telefonen. */
export const serverKoLangd = () => 0;
