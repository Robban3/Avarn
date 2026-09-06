import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adaptern som gör Next-bygget körbart i en Cloudflare Worker.
 *
 * Ingen inkrementell cache är konfigurerad: appens sidor är dynamiska och
 * renderas per förfrågan – varje vy beror på vem som är inloggad, och
 * behörighetsavgränsningen gör att två användare aldrig ska få samma svar.
 * Att cacha dem hade varit fel, inte bara onödigt.
 */
export default defineCloudflareConfig();
