/**
 * Fritext på väg in i en databasfråga.
 *
 * Prismas `contains` blir ett LIKE, där % och _ är jokertecken. En
 * sökning på "%" skulle annars träffa allt, och "_o_a" hitta Nova. Här
 * görs tecknen bokstavliga innan de skickas vidare.
 *
 * Ligger i en egen modul och inte i sok.ts, eftersom den senare bara får
 * köras på servern och därför inte går att prova.
 */
export function bokstavligt(fritext: string) {
  // Omvänt snedstreck först: annars skulle escape-tecknet självt bli
  // escapat en gång till och släppa igenom jokertecknet efter det.
  return fritext.replace(/\\/g, "\\\\").replace(/[%_]/g, "\\$&");
}
