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

export type Kopost = {
  id?: number;
  /** Vilken server action posten ska skickas till när nätet är tillbaka. */
  typ: "handelse";
  /** Formulärets fält, som de såg ut när föraren tryckte. */
  falt: [string, string][];
  skapad: number;
};

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
