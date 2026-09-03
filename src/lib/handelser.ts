import { formatTime } from "./format";

/**
 * Från registrerade händelser till ett förifyllt rapportformulär.
 *
 * Poängen med snabbregistreringen under uppdraget är att slippa skriva
 * samma sak två gånger. Markeringarna blir rader i rapporten, fynd och
 * avvikelser hamnar i sina fält, och noteringar samlas i kommentaren –
 * var och en med klockslaget de registrerades, eftersom tidsföljden är
 * det man annars minns sämst efteråt.
 *
 * Ren funktion utan databas, så att den går att prova.
 */

export type Handelse = {
  kind: string;
  note: string | null;
  at: Date;
};

/** "09:42 – hunden markerade vid band 7", eller bara klockslaget med orsak. */
function rad(handelse: Handelse) {
  const text = handelse.note?.trim();
  return text
    ? `${formatTime(handelse.at)} – ${text}`
    : `${formatTime(handelse.at)} – registrerat under uppdraget`;
}

export function franHandelser(handelser: Handelse[]) {
  if (handelser.length === 0) return null;

  const av = (kind: string) => handelser.filter((h) => h.kind === kind);
  const noteringar = [...av("NOTE"), ...av("OTHER")].sort(
    (a, b) => a.at.getTime() - b.at.getTime(),
  );

  return {
    /**
     * En rad per markering. Utfallet lämnas på formulärets standardval –
     * appen vet att hunden markerade, inte om det blev ett fynd. Det
     * avgör föraren när rapporten skrivs.
     */
    indications: av("MARKING").map((h) => ({
      location: h.note?.trim() ?? "",
      description: `Registrerad ${formatTime(h.at)}`,
      outcome: "FIND",
      handedOverTo: "",
    })),
    findings: av("FIND").map(rad).join("\n"),
    deviations: av("DEVIATION").map(rad).join("\n"),
    comment: noteringar.map(rad).join("\n"),
  };
}
