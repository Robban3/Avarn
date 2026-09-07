# Avarn Hundar

Operativt stöd för Avarn Securitys hundverksamhet: hundförare, instruktörer,
regional och nationell ledning. Byggd som en mobil först-webbapp (PWA) i
Avarns grafiska profil, med en adminpanel för skärm.

**Hela dokumentationen finns i [`DOKUMENTATION.md`](DOKUMENTATION.md)** –
översikt, ordlista, arkitektur, behörighet, datamodell, vyer, offline,
grafisk profil, drift och utveckling.

## Kom igång

Appen kör mot PostgreSQL. Använd ett Supabase-projekt eller en egen Postgres.

```bash
npm install
npm run setup     # skapar .env med slumpade hemligheter
```

Öppna sedan `.env` och fyll i de två databasadresserna. I Supabase finns de
under **Connect**:

| Variabel | Vilken anslutning | Varför |
| --- | --- | --- |
| `DATABASE_URL` | **Transaction pooler**, port 6543 | Appens anslutning. Poolaren klarar många korta anslutningar. |
| `DIRECT_URL` | **Session pooler**, port 5432 | Migreringar. Transaktionspoolaren släpper inte igenom schemaändringar, men sessionspoolaren gör det. |

**Ta poolaren, inte "Direct connection".** Båda adresserna ska börja med
`aws-0-…pooler.supabase.com`. Supabases direktanslutning
(`db.<projekt>.supabase.co`) har sedan 2024 bara en IPv6-adress, och de
flesta hemma- och kontorsnät är IPv4. Pekar `DATABASE_URL` dit får du
`Can't reach database server` vid inloggning, utan att något är fel på
lösenordet eller databasen. `npm run env:check` säger vad `.env` pekar på,
med lösenordet maskerat.

Slipp handpåläggningen: kör `npm run env:supabase`, klistra in strängen
från **Connect → Transaction pooler** och skriv lösenordet. Skriptet räknar
ut båda adresserna, kodar om tecken som `@` och `#` i lösenordet, och
kontrollerar att de går fram.

Kör du en egen Postgres kan båda peka på samma adress. Därefter:

```bash
npm run db:setup  # skapar tabellerna och lägger in exempeldata
npm run dev       # http://localhost:3000
```

Går det inte att köra `db:setup` finns SQL:en färdig i `prisma/` – se
[Drift](DOKUMENTATION.md#9-drift).

### Konton i exempeldatan

Lösenord för samtliga: `avarn123`

| Roll | E-post |
| --- | --- |
| Hundförare (Region Öst) | `erik.andersson@avarn.se` |
| Hundförare (Region Väst) | `johan.larsson@avarn.se` |
| Instruktör | `anna.karlsson@avarn.se` |
| Regionalt ansvarig | `karin.dahl@avarn.se` |
| Nationellt ansvarig | `magnus.oberg@avarn.se` |
| Administratör | `admin@avarn.se` |

## Kommandon

```bash
npm run dev        # utvecklingsserver
npm run build      # produktionsbygge
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest
npm run test:e2e   # Playwright
npm run db:migrate # ny migrering efter schemaändring
npm run env:supabase # skriver databasadresserna i .env åt dig
npm run env:check  # kontrollerar databasadresserna i .env
npm run cf:preview # kör Cloudflare-bygget lokalt i workerd
npm run cf:deploy  # driftsätter på Cloudflare Workers
```

Hela listan finns under [Utveckling](DOKUMENTATION.md#10-utveckling).

## Teknik

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 mot
PostgreSQL. Inloggningen är en signerad cookie (JWT via `jose`) med
bcrypt-hashade lösenord; formulär går genom Server Actions med
Zod-validering. Appen fungerar utan uppkoppling – se
[Offline](DOKUMENTATION.md#7-offline).

Appen driftsätts på Cloudflare Workers genom OpenNext-adaptern
(`wrangler.jsonc`). Vad som skiljer en Worker från Node står under
[Drift](DOKUMENTATION.md#9-drift).
