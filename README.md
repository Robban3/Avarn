# Avarn Hundtjänst

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
under **Project Settings → Database → Connection string**:

| Variabel | Vilken anslutning | Varför |
| --- | --- | --- |
| `DATABASE_URL` | Transaction pooler, port 6543 | Appens anslutning. Poolaren klarar många korta anslutningar. |
| `DIRECT_URL` | Direct connection, port 5432 | Migreringar. Poolaren släpper inte igenom schemaändringar. |

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
```

Hela listan finns under [Utveckling](DOKUMENTATION.md#10-utveckling).

## Teknik

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 mot
PostgreSQL. Inloggningen är en signerad cookie (JWT via `jose`) med
bcrypt-hashade lösenord; formulär går genom Server Actions med
Zod-validering. Appen fungerar utan uppkoppling – se
[Offline](DOKUMENTATION.md#7-offline).
