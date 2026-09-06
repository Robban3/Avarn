/**
 * Typer för OpenNexts byggda worker.
 *
 * `.open-next/worker.js` skapas av `npm run cf:build` och finns alltså inte
 * när `tsc` körs på ett nyklonat repo. Ett direkt importuttryck hade därför
 * gett fel ibland och gått igenom ibland, beroende på om någon råkat bygga.
 *
 * I stället importeras den under namnet `open-next-worker`, som den här
 * filen beskriver och som `wrangler.jsonc` pekar mot den riktiga filen med.
 * Typkontrollen blir densamma oavsett vad som ligger på disk.
 */
declare module "open-next-worker" {
  const worker: {
    fetch(
      forfragan: Request,
      miljo: Record<string, string | undefined>,
      kontext: { waitUntil(uppgift: Promise<unknown>): void },
    ): Promise<Response>;
  };
  export default worker;
}
