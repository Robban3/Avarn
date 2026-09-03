/**
 * Seed-data för Avarn Hundtjänst.
 *
 * Innehåller ett komplett, sammanhängande exempel: fem regioner, ett antal
 * ekipage, träningshistorik, planerad träning, uppdrag, operativa rapporter
 * samt certifikat med spridda utgångsdatum så att varningar och statistik
 * har något att visa. Namn och uppdrag följer designunderlaget.
 *
 * Kör med: npm run seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";

// Seed skriver mycket på kort tid och använder därför direktanslutningen
// när en sådan är angiven, i stället för Supabase poolare.
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL saknas. Peka den mot din databas i .env.");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** Alla konton i seed-datan delar lösenord för att testningen ska gå snabbt. */
const PASSWORD = "avarn123";

/** Datumhjälpare relativt "idag" så att datan aldrig blir inaktuell. */
const now = new Date();
const at = (dayOffset: number, hour = 8, minute = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const monthsFromNow = (months: number) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() + months);
  return d;
};
const yearsAgo = (years: number, month = 3, day = 12) =>
  new Date(now.getFullYear() - years, month, day);

async function reset() {
  // Ordningen följer beroendena; onDelete Cascade tar det mesta men vi är
  // explicita så att seed går att köra om på en befintlig databas.
  // Inställningarna nollställs också, annars läcker ett ändrat värde
  // mellan körningar och seed ger inte längre ett känt utgångsläge.
  await db.setting.deleteMany();
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.followUp.deleteMany();
  await db.comment.deleteMany();
  await db.mediaAsset.deleteMany();
  await db.indication.deleteMany();
  await db.operationalReport.deleteMany();
  await db.missionAssignment.deleteMany();
  await db.mission.deleteMany();
  await db.customer.deleteMany();
  await db.hide.deleteMany();
  await db.trainingSession.deleteMany();
  await db.plannedExercise.deleteMany();
  await db.trainingPlan.deleteMany();
  await db.certification.deleteMany();
  await db.certificationType.deleteMany();
  await db.teamAvailability.deleteMany();
  await db.instructorAssignment.deleteMany();
  await db.team.deleteMany();
  await db.dogEducation.deleteMany();
  await db.dogDiscipline.deleteMany();
  await db.searchDiscipline.deleteMany();
  await db.dog.deleteMany();
  await db.handlerProfile.deleteMany();
  await db.user.deleteMany();
  await db.region.deleteMany();
}

async function main() {
  console.log("Rensar befintlig data …");
  await reset();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ------------------------------------------------------------- Regioner
  console.log("Skapar regioner …");
  const regionData = [
    { code: "NORD", name: "Region Nord", sortOrder: 1 },
    { code: "MITT", name: "Region Mitt", sortOrder: 2 },
    { code: "OST", name: "Region Öst", sortOrder: 3 },
    { code: "VAST", name: "Region Väst", sortOrder: 4 },
    { code: "SYD", name: "Region Syd", sortOrder: 5 },
  ];
  for (const r of regionData) await db.region.create({ data: r });
  const regions = Object.fromEntries(
    (await db.region.findMany()).map((r) => [r.code, r]),
  );

  // ---------------------------------------------------------- Sökinriktningar
  console.log("Skapar sökinriktningar …");
  const disciplineData = [
    { code: "SPAR", name: "Spårsök", shortLabel: "SÖK – SPÅR", sortOrder: 1,
      description: "Spårsök efter person eller föremål." },
    { code: "YTA", name: "Ytsök", shortLabel: "SÖK – YTA", sortOrder: 2,
      description: "Ytsök över öppna och bebyggda områden." },
    { code: "GODS", name: "Godssök", shortLabel: "SÖK – GODS", sortOrder: 3,
      description: "Sök i gods, bagage och fordon." },
    { code: "NARKOTIKA", name: "Narkotika", shortLabel: "NARKOTIKA", sortOrder: 4,
      description: "Sök efter narkotiska preparat." },
    { code: "SPRANG", name: "Sprängämnen", shortLabel: "SPRÄNGÄMNEN", sortOrder: 5,
      description: "Sök efter explosiva ämnen." },
    { code: "VAPEN", name: "Vapen", shortLabel: "VAPEN", sortOrder: 6,
      description: "Sök efter vapen och ammunition." },
  ];
  for (const d of disciplineData) await db.searchDiscipline.create({ data: d });
  const disc = Object.fromEntries(
    (await db.searchDiscipline.findMany()).map((d) => [d.code, d]),
  );

  // -------------------------------------------------------- Certifikattyper
  console.log("Skapar certifikattyper …");
  const certTypeData = [
    { code: "NHPR", name: "NHPR Godkänd", validityMonths: 12, appliesTo: "TEAM",
      description: "Nationellt hundprov för räddning och sök." },
    { code: "EKIPAGE", name: "Auktoriserat ekipage", validityMonths: 24, appliesTo: "TEAM",
      description: "Behörighet att arbeta operativt som ekipage." },
    { code: "NARK_CERT", name: "Certifikat narkotikasök", validityMonths: 12, appliesTo: "DOG" },
    { code: "SPRANG_CERT", name: "Certifikat sprängämnessök", validityMonths: 12, appliesTo: "DOG" },
    { code: "SKYDDSVAKT", name: "Skyddsvaktsförordnande", validityMonths: 36, appliesTo: "HANDLER" },
    { code: "HLR", name: "HLR och första hjälpen", validityMonths: 24, appliesTo: "HANDLER" },
  ];
  for (const c of certTypeData) await db.certificationType.create({ data: c });
  const certType = Object.fromEntries(
    (await db.certificationType.findMany()).map((c) => [c.code, c]),
  );

  // ----------------------------------------------------------- Användare
  console.log("Skapar användare …");
  const mkUser = (
    email: string,
    name: string,
    role: string,
    regionCode: string | null,
    phone?: string,
  ) =>
    db.user.create({
      data: {
        email,
        name,
        role,
        passwordHash,
        phone,
        regionId: regionCode ? regions[regionCode].id : null,
      },
    });

  const erik = await mkUser("erik.andersson@avarn.se", "Erik Andersson", "HANDLER", "OST", "070-123 45 67");
  const maria = await mkUser("maria.svensson@avarn.se", "Maria Svensson", "HANDLER", "OST", "070-234 56 78");
  const johan = await mkUser("johan.larsson@avarn.se", "Johan Larsson", "HANDLER", "VAST", "070-345 67 89");
  const sofie = await mkUser("sofie.holm@avarn.se", "Sofie Holm", "HANDLER", "SYD", "070-456 78 90");
  const anders = await mkUser("anders.berg@avarn.se", "Anders Berg", "HANDLER", "NORD", "070-567 89 01");
  const lisa = await mkUser("lisa.ek@avarn.se", "Lisa Ek", "HANDLER", "MITT", "070-678 90 12");

  const anna = await mkUser("anna.karlsson@avarn.se", "Anna Karlsson", "INSTRUCTOR", "OST", "070-789 01 23");
  const peter = await mkUser("peter.nyman@avarn.se", "Peter Nyman", "INSTRUCTOR", "VAST", "070-890 12 34");

  const karin = await mkUser("karin.dahl@avarn.se", "Karin Dahl", "REGIONAL_MANAGER", "OST", "070-901 23 45");
  const magnus = await mkUser("magnus.oberg@avarn.se", "Magnus Öberg", "NATIONAL_MANAGER", null, "070-012 34 56");
  const admin = await mkUser("admin@avarn.se", "Systemadministratör", "ADMIN", null);

  const handlers = [erik, maria, johan, sofie, anders, lisa];
  for (const h of handlers) {
    await db.handlerProfile.create({
      data: {
        userId: h.id,
        employeeNumber: `AV-${1000 + handlers.indexOf(h)}`,
        baseLocation: {
          [erik.id]: "Stockholm",
          [maria.id]: "Södertälje",
          [johan.id]: "Göteborg",
          [sofie.id]: "Malmö",
          [anders.id]: "Umeå",
          [lisa.id]: "Örebro",
        }[h.id],
        bio: "Operativ hundförare inom Avarn Security.",
      },
    });
  }

  // --------------------------------------------------------------- Hundar
  console.log("Skapar hundar och ekipage …");
  const dogSpec = [
    { key: "nova", name: "Nova", breed: "Belgisk vallhund (Malinois)", years: 4, sex: "TIK",
      handler: erik, region: "OST", chip: "752098100812345",
      disciplines: ["NARKOTIKA", "SPRANG", "VAPEN"],
      educations: [
        "Grundutbildning",
        "Fortsättningsutbildning",
        "Specialistutbildning Narkotika",
        "Vidareutbildning Sök & Markering",
      ],
      details: {
        registrationNumber: "SE-AVAR-2020-1127",
        insurer: "Folksam",
        insuranceValidTo: new Date("2027-12-31"),
        weightKg: 28,
        heightCm: 62,
        color: "Fawn med svart mask",
        hipsElbows: "A / 0",
        mentalIndex: "5 / 5",
        originCountry: "Sverige",
        neutered: false,
      } },
    { key: "rex", name: "Rex", breed: "Labrador Retriever", years: 6, sex: "HANE",
      handler: erik, region: "OST", chip: "752098100234567",
      disciplines: ["NARKOTIKA", "GODS"], educations: ["Grundutbildning"],
      details: { registrationNumber: "SE-AVAR-2018-0904", insurer: "Agria",
        insuranceValidTo: new Date("2027-06-30"), weightKg: 32, heightCm: 58,
        color: "Svart", hipsElbows: "B / 0", mentalIndex: "4 / 5",
        originCountry: "Sverige", neutered: true } },
    { key: "balder", name: "Balder", breed: "Schäfer", years: 5, sex: "HANE",
      handler: johan, region: "VAST", chip: "752098100345678",
      disciplines: ["SPAR", "YTA"], educations: ["Grundutbildning", "Fortsättningsutbildning"],
      details: { registrationNumber: "SE-AVAR-2019-0451", insurer: "Agria",
        insuranceValidTo: new Date("2027-03-31"), weightKg: 36, heightCm: 65,
        color: "Svart och tan", hipsElbows: "A / 0", mentalIndex: "5 / 4",
        originCountry: "Tyskland", neutered: false } },
    { key: "mira", name: "Mira", breed: "Springer Spaniel", years: 3, sex: "TIK",
      handler: sofie, region: "SYD", chip: "752098100456789",
      disciplines: ["NARKOTIKA", "GODS"], educations: ["Grundutbildning"],
      details: { registrationNumber: "SE-AVAR-2021-1330", insurer: "Folksam",
        insuranceValidTo: new Date("2026-11-30"), weightKg: 19, heightCm: 48,
        color: "Brun och vit", hipsElbows: "A / 0", mentalIndex: "4 / 4",
        originCountry: "Sverige", neutered: false } },
    { key: "sigge", name: "Sigge", breed: "Labrador Retriever", years: 7, sex: "HANE",
      handler: maria, region: "OST", chip: "752098100567890",
      disciplines: ["SPRANG", "GODS"], educations: ["Grundutbildning", "Fortsättningsutbildning"] },
    { key: "iris", name: "Iris", breed: "Belgisk vallhund (Malinois)", years: 2, sex: "TIK",
      handler: anders, region: "NORD", chip: "752098100678901",
      disciplines: ["SPAR", "YTA"], educations: ["Grundutbildning"] },
    { key: "zeb", name: "Zeb", breed: "Schäfer", years: 8, sex: "HANE",
      handler: lisa, region: "MITT", chip: "752098100789012",
      disciplines: ["NARKOTIKA"], educations: ["Grundutbildning", "Fortsättningsutbildning"] },
    { key: "tira", name: "Tira", breed: "Springer Spaniel", years: 4, sex: "TIK",
      handler: maria, region: "OST", chip: "752098100890123",
      disciplines: ["NARKOTIKA", "VAPEN"], educations: ["Grundutbildning"] },
  ];

  const dogs: Record<string, { id: string }> = {};
  const teams: Record<string, { id: string }> = {};

  for (const spec of dogSpec) {
    const dog = await db.dog.create({
      data: {
        name: spec.name,
        breed: spec.breed,
        birthDate: yearsAgo(spec.years),
        sex: spec.sex,
        chipNumber: spec.chip,
        status: "ACTIVE",
        ...("details" in spec ? spec.details : {}),
        disciplines: {
          create: spec.disciplines.map((code, i) => ({
            disciplineId: disc[code].id,
            level: i === 0 ? "SPECIALIST" : "GRUND",
            certifiedAt: at(-400 + i * 30),
          })),
        },
        educations: {
          create: spec.educations.map((name, i) => ({
            name,
            provider: "Avarn Security Hundutbildning",
            // Jämnt fördelade bakåt i tiden, äldsta först, så att
            // tidslinjen på hundprofilen läses vänster till höger.
            completedAt: at(-(spec.educations.length - i) * 320),
          })),
        },
      },
    });
    dogs[spec.key] = dog;

    const team = await db.team.create({
      data: {
        handlerId: spec.handler.id,
        dogId: dog.id,
        regionId: regions[spec.region].id,
        startedAt: at(-spec.years * 200),
        status: "ACTIVE",
      },
    });
    teams[spec.key] = team;
  }

  // Instruktörernas ekipage
  const annaTeams = ["nova", "rex", "sigge", "tira", "mira"];
  const peterTeams = ["balder", "iris", "zeb"];
  for (const key of annaTeams)
    await db.instructorAssignment.create({
      data: { instructorId: anna.id, teamId: teams[key].id },
    });
  for (const key of peterTeams)
    await db.instructorAssignment.create({
      data: { instructorId: peter.id, teamId: teams[key].id },
    });

  // Tillgänglighet – används vid uppdragstilldelning
  for (const key of Object.keys(teams)) {
    await db.teamAvailability.create({
      data: {
        teamId: teams[key].id,
        startAt: at(0, 6),
        endAt: at(30, 20),
        kind: "AVAILABLE",
        note: "Ordinarie tjänstgöring",
      },
    });
  }
  await db.teamAvailability.create({
    data: {
      teamId: teams.zeb.id,
      startAt: at(2, 0),
      endAt: at(9, 23),
      kind: "UNAVAILABLE",
      note: "Semester",
    },
  });

  // ---------------------------------------------------------- Certifikat
  console.log("Skapar certifikat …");
  const certs: Array<{
    typeCode: string;
    teamKey?: string;
    dogKey?: string;
    userId?: string;
    issuedMonths: number;
    expiresMonths: number;
    issuer?: string;
  }> = [
    // Eriks ekipage – ett giltigt, ett som snart går ut
    { typeCode: "NHPR", teamKey: "nova", issuedMonths: -4, expiresMonths: 8, issuer: "Svenska Brukshundklubben" },
    { typeCode: "EKIPAGE", teamKey: "nova", issuedMonths: -8, expiresMonths: 16, issuer: "Avarn Security" },
    { typeCode: "NARK_CERT", dogKey: "nova", issuedMonths: -11, expiresMonths: 1, issuer: "Avarn Security" },
    { typeCode: "NHPR", teamKey: "rex", issuedMonths: -10, expiresMonths: 2, issuer: "Svenska Brukshundklubben" },
    { typeCode: "EKIPAGE", teamKey: "rex", issuedMonths: -6, expiresMonths: 18 },
    // Johan/Balder – ett som går ut om två dagar (syns som varning)
    { typeCode: "EKIPAGE", teamKey: "balder", issuedMonths: -24, expiresMonths: 0, issuer: "Avarn Security" },
    { typeCode: "NHPR", teamKey: "balder", issuedMonths: -3, expiresMonths: 9 },
    { typeCode: "NHPR", teamKey: "mira", issuedMonths: -2, expiresMonths: 10 },
    { typeCode: "EKIPAGE", teamKey: "mira", issuedMonths: -12, expiresMonths: 12 },
    { typeCode: "SPRANG_CERT", dogKey: "sigge", issuedMonths: -9, expiresMonths: 3 },
    { typeCode: "EKIPAGE", teamKey: "sigge", issuedMonths: -5, expiresMonths: 19 },
    { typeCode: "NHPR", teamKey: "iris", issuedMonths: -1, expiresMonths: 11 },
    { typeCode: "EKIPAGE", teamKey: "zeb", issuedMonths: -23, expiresMonths: 1 },
    { typeCode: "NARK_CERT", dogKey: "zeb", issuedMonths: -13, expiresMonths: -1 }, // utgången
    { typeCode: "NHPR", teamKey: "tira", issuedMonths: -7, expiresMonths: 5 },
    // Förarnas egna behörigheter
    { typeCode: "SKYDDSVAKT", userId: erik.id, issuedMonths: -20, expiresMonths: 16 },
    { typeCode: "HLR", userId: erik.id, issuedMonths: -22, expiresMonths: 2 },
    { typeCode: "SKYDDSVAKT", userId: maria.id, issuedMonths: -30, expiresMonths: 6 },
    { typeCode: "HLR", userId: johan.id, issuedMonths: -23, expiresMonths: 1 },
    { typeCode: "SKYDDSVAKT", userId: sofie.id, issuedMonths: -12, expiresMonths: 24 },
  ];

  for (const c of certs) {
    await db.certification.create({
      data: {
        typeId: certType[c.typeCode].id,
        teamId: c.teamKey ? teams[c.teamKey].id : null,
        dogId: c.dogKey ? dogs[c.dogKey].id : null,
        userId: c.userId ?? null,
        issuer: c.issuer ?? "Avarn Security",
        reference: `${c.typeCode}-${Math.floor(1000 + Math.random() * 8999)}`,
        issuedAt: monthsFromNow(c.issuedMonths),
        expiresAt:
          c.expiresMonths === 0
            ? at(2, 12) // går ut om två dagar
            : monthsFromNow(c.expiresMonths),
      },
    });
  }

  // ------------------------------------------------------ Träningsplaner
  console.log("Skapar träningsplaner och övningar …");
  const novaPlan = await db.trainingPlan.create({
    data: {
      teamId: teams.nova.id,
      instructorId: anna.id,
      title: "Uthållighet i svår terräng",
      purpose:
        "Bygga uthållighet över längre sök och stabilisera markering vid stenrösen och rotvältor.",
      periodStart: at(-21),
      periodEnd: at(35),
      status: "ACTIVE",
      exercises: {
        create: [
          {
            title: "Områdessök 45 minuter i kuperad skog",
            instructions:
              "Två pass om 45 minuter med minst fem gömmor. Fokus på systematiskt sökmönster och att hunden håller tempot hela passet.",
            disciplineId: disc.NARKOTIKA.id,
            targetOdor: "Narkotika",
            environment: "Skog",
            dueDate: at(6),
            sortOrder: 1,
            status: "PLANNED",
          },
          {
            title: "Höga gömmor i lagermiljö",
            instructions:
              "Placera gömmor på 150–220 cm. Belöna först vid tydlig och kvarstående markering.",
            disciplineId: disc.NARKOTIKA.id,
            targetOdor: "Narkotika",
            environment: "Lagerlokal",
            dueDate: at(13),
            sortOrder: 2,
            status: "PLANNED",
          },
          {
            title: "Fordonssök under tidspress",
            instructions:
              "Sex fordon, max 12 minuter totalt. Syftet är att hålla noggrannheten uppe när tempot ökar.",
            disciplineId: disc.GODS.id,
            targetOdor: "Narkotika",
            environment: "Fordon",
            dueDate: at(20),
            sortOrder: 3,
            status: "PLANNED",
          },
        ],
      },
    },
    include: { exercises: true },
  });

  await db.trainingPlan.create({
    data: {
      teamId: teams.balder.id,
      instructorId: peter.id,
      title: "Spårsäkerhet på hårt underlag",
      purpose: "Öka spårsäkerheten på asfalt och grus samt vid vinkelspår.",
      periodStart: at(-14),
      periodEnd: at(42),
      status: "ACTIVE",
      exercises: {
        create: [
          {
            title: "Vinkelspår 600 meter",
            instructions: "Tre räta vinklar, 45 minuter gammalt spår.",
            disciplineId: disc.SPAR.id,
            targetOdor: "Människa",
            environment: "Stadsmiljö",
            dueDate: at(4),
            sortOrder: 1,
            status: "PLANNED",
          },
          {
            title: "Ytsök öppen mark 30 minuter",
            instructions: "Två figuranter, växlande vindriktning.",
            disciplineId: disc.YTA.id,
            targetOdor: "Människa",
            environment: "Öppen mark",
            dueDate: at(11),
            sortOrder: 2,
            status: "PLANNED",
          },
        ],
      },
    },
  });

  // ------------------------------------------------------- Träningspass
  console.log("Skapar träningspass …");
  type SessionSpec = {
    teamKey: string;
    dayOffset: number;
    startHour: number;
    startMin: number;
    endHour: number;
    endMin: number;
    location: string;
    trainingArea: string;
    environment: string;
    targetOdor: string;
    disciplineCode: string;
    hideCount: number;
    foundCount: number;
    comment: string;
    status: string;
    handlerId: string;
  };

  const sessionSpecs: SessionSpec[] = [
    {
      teamKey: "nova", dayOffset: -9, startHour: 9, startMin: 0, endHour: 11, endMin: 15,
      location: "Tyresta, Stockholm", trainingArea: "Områdessök", environment: "Skog",
      targetOdor: "Narkotika", disciplineCode: "NARKOTIKA", hideCount: 5, foundCount: 4,
      comment:
        "Bra genomförande. Stabilt sök i svår terräng. Missade en gömma vid stenröse.",
      status: "APPROVED", handlerId: erik.id,
    },
    {
      teamKey: "nova", dayOffset: -16, startHour: 13, startMin: 30, endHour: 15, endMin: 0,
      location: "Jordbro terminal", trainingArea: "Bagagesök", environment: "Terminal",
      targetOdor: "Narkotika", disciplineCode: "NARKOTIKA", hideCount: 6, foundCount: 6,
      comment: "Felfritt pass. Hög arbetsglädje genom hela söket.",
      status: "APPROVED", handlerId: erik.id,
    },
    {
      teamKey: "nova", dayOffset: -23, startHour: 8, startMin: 0, endHour: 9, endMin: 45,
      location: "Arlanda, hangar 4", trainingArea: "Byggnadssök", environment: "Lagerlokal",
      targetOdor: "Sprängämnen", disciplineCode: "SPRANG", hideCount: 4, foundCount: 3,
      comment: "Tveksam vid höga gömmor. Behöver mer träning över 180 cm.",
      status: "APPROVED", handlerId: erik.id,
    },
    {
      teamKey: "nova", dayOffset: -3, startHour: 17, startMin: 0, endHour: 18, endMin: 30,
      location: "Farsta industriområde", trainingArea: "Fordonssök", environment: "Fordon",
      targetOdor: "Narkotika", disciplineCode: "GODS", hideCount: 5, foundCount: 5,
      comment: "Snabbt och rent sök på sex fordon.",
      status: "SUBMITTED", handlerId: erik.id,
    },
    {
      teamKey: "rex", dayOffset: -5, startHour: 10, startMin: 0, endHour: 11, endMin: 30,
      location: "Södertälje hamn", trainingArea: "Bagagesök", environment: "Lagerlokal",
      targetOdor: "Narkotika", disciplineCode: "GODS", hideCount: 4, foundCount: 4,
      comment: "Stabilt. Rex arbetar lugnt och metodiskt.",
      status: "APPROVED", handlerId: erik.id,
    },
    {
      teamKey: "balder", dayOffset: -2, startHour: 7, startMin: 30, endHour: 9, endMin: 0,
      location: "Slottsskogen, Göteborg", trainingArea: "Spårarbete", environment: "Öppen mark",
      targetOdor: "Människa", disciplineCode: "SPAR", hideCount: 3, foundCount: 3,
      comment: "Höll spåret genom samtliga vinklar.",
      status: "SUBMITTED", handlerId: johan.id,
    },
    {
      teamKey: "mira", dayOffset: -4, startHour: 14, startMin: 0, endHour: 15, endMin: 30,
      location: "Malmö godsterminal", trainingArea: "Bagagesök", environment: "Terminal",
      targetOdor: "Narkotika", disciplineCode: "NARKOTIKA", hideCount: 5, foundCount: 4,
      comment: "En falsk markering vid tomt kolli.",
      status: "APPROVED", handlerId: sofie.id,
    },
    {
      teamKey: "sigge", dayOffset: -6, startHour: 9, startMin: 0, endHour: 10, endMin: 45,
      location: "Arlanda terminal 5", trainingArea: "Bagagesök", environment: "Terminal",
      targetOdor: "Sprängämnen", disciplineCode: "SPRANG", hideCount: 6, foundCount: 5,
      comment: "Bra tempo, tappade fokus mot slutet av passet.",
      status: "APPROVED", handlerId: maria.id,
    },
    {
      teamKey: "iris", dayOffset: -8, startHour: 11, startMin: 0, endHour: 12, endMin: 15,
      location: "Umeå, Nydalaområdet", trainingArea: "Områdessök", environment: "Skog",
      targetOdor: "Människa", disciplineCode: "YTA", hideCount: 3, foundCount: 2,
      comment: "Ung hund, behöver kortare pass tills uthålligheten byggts upp.",
      status: "APPROVED", handlerId: anders.id,
    },
    {
      teamKey: "zeb", dayOffset: -12, startHour: 8, startMin: 30, endHour: 10, endMin: 0,
      location: "Örebro logistikcenter", trainingArea: "Byggnadssök", environment: "Lagerlokal",
      targetOdor: "Narkotika", disciplineCode: "NARKOTIKA", hideCount: 5, foundCount: 5,
      comment: "Rutinerat och effektivt.",
      status: "APPROVED", handlerId: lisa.id,
    },
    {
      teamKey: "tira", dayOffset: -7, startHour: 15, startMin: 0, endHour: 16, endMin: 20,
      location: "Södertälje, Ronna", trainingArea: "Personsök", environment: "Stadsmiljö",
      targetOdor: "Narkotika", disciplineCode: "NARKOTIKA", hideCount: 4, foundCount: 3,
      comment: "Störningsträning i folkvimmel. God kontakt med föraren.",
      status: "APPROVED", handlerId: maria.id,
    },
  ];

  const createdSessions: Record<string, string> = {};
  for (const [i, s] of sessionSpecs.entries()) {
    const session = await db.trainingSession.create({
      data: {
        teamId: teams[s.teamKey].id,
        startAt: at(s.dayOffset, s.startHour, s.startMin),
        endAt: at(s.dayOffset, s.endHour, s.endMin),
        location: s.location,
        trainingArea: s.trainingArea,
        environment: s.environment,
        targetOdor: s.targetOdor,
        disciplineId: disc[s.disciplineCode].id,
        hideCount: s.hideCount,
        foundCount: s.foundCount,
        comment: s.comment,
        status: s.status,
        createdById: s.handlerId,
        approvedById: s.status === "APPROVED" ? (annaTeams.includes(s.teamKey) ? anna.id : peter.id) : null,
        approvedAt: s.status === "APPROVED" ? at(s.dayOffset + 1, 12) : null,
        hides: {
          create: Array.from({ length: s.hideCount }, (_, h) => ({
            label: `Gömma ${h + 1}`,
            placement: [
              "Marknivå vid stubbe",
              "Stenröse, 40 cm höjd",
              "Rotvälta",
              "Hylla 180 cm",
              "Bakom stolpe",
              "Under pall",
            ][h % 6],
            heightCm: [10, 40, 25, 180, 60, 15][h % 6],
            difficulty: ["LATT", "MEDEL", "SVAR"][h % 3],
            outcome: h < s.foundCount ? "FOUND" : "MISSED",
            searchSeconds: 60 + h * 35,
            sortOrder: h + 1,
          })),
        },
      },
    });
    createdSessions[`${s.teamKey}-${i}`] = session.id;
  }

  // Historik längre bak, så att utvecklingen går att följa över tid.
  // Varje ekipage får ett par pass i månaden fem månader tillbaka.
  console.log("Skapar träningshistorik …");
  const historyTeams: { key: string; handlerId: string; discipline: string }[] = [
    { key: "nova", handlerId: erik.id, discipline: "NARKOTIKA" },
    { key: "rex", handlerId: erik.id, discipline: "GODS" },
    { key: "balder", handlerId: johan.id, discipline: "SPAR" },
    { key: "mira", handlerId: sofie.id, discipline: "NARKOTIKA" },
    { key: "sigge", handlerId: maria.id, discipline: "SPRANG" },
    { key: "iris", handlerId: anders.id, discipline: "YTA" },
    { key: "zeb", handlerId: lisa.id, discipline: "NARKOTIKA" },
    { key: "tira", handlerId: maria.id, discipline: "NARKOTIKA" },
  ];

  const historyAreas = ["Områdessök", "Byggnadssök", "Fordonssök", "Bagagesök"];
  const historyEnvironments = ["Skog", "Lagerlokal", "Fordon", "Terminal"];
  const historyPlaces = [
    "Tyresta, Stockholm",
    "Jordbro terminal",
    "Farsta industriområde",
    "Slottsskogen, Göteborg",
    "Malmö godsterminal",
    "Umeå, Nydalaområdet",
    "Örebro logistikcenter",
  ];

  for (const spec of historyTeams) {
    // Två pass i månaden, 30 till 150 dagar tillbaka.
    for (let week = 5; week <= 21; week += 2) {
      const dayOffset = -week * 7 - (week % 3);
      const index = week % 4;
      const hides = 4 + (week % 3);
      // Träffsäkerheten stiger svagt över tid, som ett ekipage i utveckling.
      const misses = week > 13 ? 1 : week > 8 ? (week % 2) : 0;

      await db.trainingSession.create({
        data: {
          teamId: teams[spec.key].id,
          startAt: at(dayOffset, 9, 0),
          endAt: at(dayOffset, 10, 30 + (week % 3) * 15),
          location: historyPlaces[week % historyPlaces.length],
          trainingArea: historyAreas[index],
          environment: historyEnvironments[index],
          targetOdor:
            spec.discipline === "SPAR" || spec.discipline === "YTA"
              ? "Människa"
              : spec.discipline === "SPRANG"
                ? "Sprängämnen"
                : "Narkotika",
          disciplineId: disc[spec.discipline].id,
          hideCount: hides,
          foundCount: hides - misses,
          comment: "Ordinarie underhållsträning.",
          status: "APPROVED",
          createdById: spec.handlerId,
          approvedById: annaTeams.includes(spec.key) ? anna.id : peter.id,
          approvedAt: at(dayOffset + 1, 12),
        },
      });
    }
  }

  // Kopplar det senaste godkända Nova-passet till en genomförd planövning
  const firstExercise = novaPlan.exercises.find((e) => e.sortOrder === 1);
  if (firstExercise) {
    await db.trainingSession.update({
      where: { id: createdSessions["nova-0"] },
      data: { plannedExerciseId: firstExercise.id },
    });
    await db.plannedExercise.update({
      where: { id: firstExercise.id },
      data: { status: "COMPLETED" },
    });
  }

  // Instruktörskommentarer på träning
  await db.comment.create({
    data: {
      authorId: anna.id,
      trainingSessionId: createdSessions["nova-0"],
      body: "Bra jobbat! Fortsätt nöta på uthålligheten.",
      createdAt: at(-8, 9, 15),
    },
  });
  await db.comment.create({
    data: {
      authorId: anna.id,
      trainingSessionId: createdSessions["nova-2"],
      body: "Lägg in fler höga gömmor kommande veckor, gärna 180–220 cm.",
      createdAt: at(-22, 14, 0),
    },
  });
  await db.comment.create({
    data: {
      authorId: peter.id,
      trainingSessionId: createdSessions["iris-8"],
      body: "Helt rätt tänkt att korta passen. Bygg på fem minuter i taget.",
      createdAt: at(-7, 11, 30),
    },
  });

  // ------------------------------------------------------------- Kunder
  console.log("Skapar kunder och uppdrag …");
  const swedavia = await db.customer.create({
    data: { name: "Swedavia AB", orgNumber: "556797-0818", contactName: "Lars Holmberg",
      contactPhone: "010-109 00 00", contactEmail: "sakerhet@swedavia.se" },
  });
  const friends = await db.customer.create({
    data: { name: "Friends Arena", orgNumber: "556768-2942", contactName: "Nina Ek",
      contactPhone: "08-500 300 00", contactEmail: "drift@friendsarena.se" },
  });
  const logistik = await db.customer.create({
    data: { name: "Jordbro Logistik AB", orgNumber: "556123-4567", contactName: "Tomas Ek",
      contactPhone: "08-555 12 00", contactEmail: "lager@jordbrologistik.se" },
  });
  const bostads = await db.customer.create({
    data: { name: "Uppsalahem", orgNumber: "556137-3589", contactName: "Petra Lund",
      contactPhone: "018-727 30 00", contactEmail: "trygghet@uppsalahem.se" },
  });

  type MissionSpec = {
    key: string;
    reference: string;
    title: string;
    missionType: string;
    customerId: string;
    contactName: string;
    contactPhone: string;
    dayOffset: number;
    startHour: number;
    startMin: number;
    durationHours: number;
    address: string;
    locality: string;
    /** Underlaget till platsvyn. Utelämnas för uppdrag som ligger i historiken. */
    meetingPoint?: string;
    parkingInfo?: string;
    equipment?: string;
    missionArea?: string;
    lat?: number;
    lng?: number;
    regionCode: string;
    disciplineCode: string;
    specialInstructions: string;
    status: string;
    assignTeam?: string;
    assignmentStatus?: string;
  };

  const missionSpecs: MissionSpec[] = [
    {
      key: "arlanda", reference: "UPP-2451", title: "Flygplatskontroll",
      missionType: "Flygplatskontroll", customerId: swedavia.id,
      contactName: "Lars Holmberg", contactPhone: "010-109 00 00",
      dayOffset: 3, startHour: 8, startMin: 0, durationHours: 2,
      address: "Terminal 5, bagagehall", locality: "Arlanda, Stockholm",
      meetingPoint: "P5, Personalentré",
      parkingInfo: "Parkering P5. Passerkort krävs vid bom.",
      equipment: "Väst\nID-kort\nFicklampa\nVäderkläder",
      missionArea: "Terminal 5, Bagagehall",
      lat: 59.6498, lng: 17.9239,
      regionCode: "OST", disciplineCode: "SPAR",
      specialInstructions:
        "Anmälan i säkerhetskontrollen senast 07:45. ID-handling och förordnande ska medföras. Sök sker i bagagehall och angränsande lastutrymme.",
      status: "ASSIGNED", assignTeam: "nova", assignmentStatus: "ACCEPTED",
    },
    {
      key: "friends", reference: "UPP-2452", title: "Evenemangssök",
      missionType: "Evenemangssök", customerId: friends.id,
      contactName: "Nina Ek", contactPhone: "08-500 300 00",
      dayOffset: 4, startHour: 14, startMin: 30, durationHours: 3,
      address: "Friends Arena, entré C", locality: "Solna",
      meetingPoint: "Entré C, vaktkuren",
      parkingInfo: "Arenagaraget plan 2, avsatta platser för utryckningsfordon.",
      equipment: "Väst\nID-kort\nFicklampa",
      missionArea: "Läktarsektion A–D",
      lat: 59.3729, lng: 18.0009,
      regionCode: "OST", disciplineCode: "YTA",
      specialInstructions:
        "Genomsökning av läktarsektion A–D före publikinsläpp. Klart senast 17:30.",
      status: "ASSIGNED", assignTeam: "nova", assignmentStatus: "OFFERED",
    },
    {
      key: "jordbro", reference: "UPP-2453", title: "Lagerkontroll",
      missionType: "Lagerkontroll", customerId: logistik.id,
      contactName: "Tomas Ek", contactPhone: "08-555 12 00",
      dayOffset: 5, startHour: 10, startMin: 0, durationHours: 4,
      address: "Lagerväg 12", locality: "Jordbro, Haninge",
      meetingPoint: "Lastkaj 3, receptionen",
      parkingInfo: "Besöksparkering utanför grind 1.",
      equipment: "Väst\nID-kort\nSkyddsskor\nHörselskydd",
      missionArea: "Lagerhall B och lastzon",
      lat: 59.1447, lng: 18.1247,
      regionCode: "OST", disciplineCode: "GODS",
      specialInstructions: "Samordnas med lagerchef på plats. Truckar stoppas under sök.",
      status: "PLANNED",
    },
    {
      key: "uppsala", reference: "UPP-2454", title: "Bostadssök",
      missionType: "Bostadssök", customerId: bostads.id,
      contactName: "Petra Lund", contactPhone: "018-727 30 00",
      dayOffset: 7, startHour: 9, startMin: 30, durationHours: 3,
      address: "Gränbyvägen 8", locality: "Uppsala",
      meetingPoint: "Gatan utanför port B",
      equipment: "Väst\nID-kort\nFicklampa",
      lat: 59.8767, lng: 17.6656,
      regionCode: "OST", disciplineCode: "SPAR",
      specialInstructions: "Polis närvarar. Invänta klartecken innan sök påbörjas.",
      status: "PLANNED",
    },
    {
      key: "goteborg", reference: "UPP-2448", title: "Objektsbevakning hamnen",
      missionType: "Objektsbevakning", customerId: logistik.id,
      contactName: "Tomas Ek", contactPhone: "031-555 00 12",
      dayOffset: 6, startHour: 20, startMin: 0, durationHours: 6,
      address: "Skandiahamnen, port 4", locality: "Göteborg",
      meetingPoint: "Port 4, terminalkontoret",
      parkingInfo: "Parkering innanför port 4, anmäl fordonet i porten.",
      equipment: "Väst\nID-kort\nFicklampa\nVäderkläder\nRadio",
      missionArea: "Kajplan och containerupplag",
      lat: 57.7089, lng: 11.8874,
      regionCode: "VAST", disciplineCode: "YTA",
      specialInstructions: "Nattpass. Rapportering till larmcentral varannan timme.",
      status: "ASSIGNED", assignTeam: "balder", assignmentStatus: "ACCEPTED",
    },
    // Genomförda uppdrag som ger historik och statistik
    {
      key: "arlanda_hist", reference: "UPP-2431", title: "Flygplatskontroll",
      missionType: "Flygplatskontroll", customerId: swedavia.id,
      contactName: "Lars Holmberg", contactPhone: "010-109 00 00",
      dayOffset: -10, startHour: 8, startMin: 0, durationHours: 2,
      address: "Terminal 5, bagagehall", locality: "Arlanda, Stockholm",
      regionCode: "OST", disciplineCode: "SPAR",
      specialInstructions: "Rutinkontroll enligt avtal.",
      status: "COMPLETED", assignTeam: "nova", assignmentStatus: "COMPLETED",
    },
    {
      key: "lager_hist", reference: "UPP-2427", title: "Lagerkontroll",
      missionType: "Lagerkontroll", customerId: logistik.id,
      contactName: "Tomas Ek", contactPhone: "08-555 12 00",
      dayOffset: -17, startHour: 13, startMin: 0, durationHours: 3,
      address: "Lagerväg 12", locality: "Jordbro, Haninge",
      regionCode: "OST", disciplineCode: "GODS",
      specialInstructions: "Kvartalskontroll.",
      status: "COMPLETED", assignTeam: "rex", assignmentStatus: "COMPLETED",
    },
    {
      key: "malmo_hist", reference: "UPP-2422", title: "Godskontroll",
      missionType: "Lagerkontroll", customerId: logistik.id,
      contactName: "Tomas Ek", contactPhone: "040-555 00 20",
      dayOffset: -21, startHour: 9, startMin: 0, durationHours: 4,
      address: "Terminalgatan 3", locality: "Malmö",
      regionCode: "SYD", disciplineCode: "GODS",
      specialInstructions: "Sök av inkommande gods från hamnen.",
      status: "COMPLETED", assignTeam: "mira", assignmentStatus: "COMPLETED",
    },
  ];

  const missions: Record<string, { id: string }> = {};
  for (const m of missionSpecs) {
    const mission = await db.mission.create({
      data: {
        reference: m.reference,
        title: m.title,
        missionType: m.missionType,
        customerId: m.customerId,
        contactName: m.contactName,
        contactPhone: m.contactPhone,
        startAt: at(m.dayOffset, m.startHour, m.startMin),
        endAt: at(m.dayOffset, m.startHour + m.durationHours, m.startMin),
        address: m.address,
        locality: m.locality,
        meetingPoint: m.meetingPoint ?? null,
        parkingInfo: m.parkingInfo ?? null,
        equipment: m.equipment ?? null,
        missionArea: m.missionArea ?? null,
        latitude: m.lat ?? null,
        longitude: m.lng ?? null,
        regionId: regions[m.regionCode].id,
        disciplineId: disc[m.disciplineCode].id,
        specialInstructions: m.specialInstructions,
        status: m.status,
        createdById: karin.id,
      },
    });
    missions[m.key] = mission;

    if (m.assignTeam) {
      await db.missionAssignment.create({
        data: {
          missionId: mission.id,
          teamId: teams[m.assignTeam].id,
          assignedById: karin.id,
          status: m.assignmentStatus ?? "OFFERED",
          respondedAt: m.assignmentStatus === "OFFERED" ? null : at(m.dayOffset - 1, 16),
        },
      });
    }
  }

  // -------------------------------------------------- Operativa rapporter
  console.log("Skapar operativa rapporter …");
  const report1 = await db.operationalReport.create({
    data: {
      missionId: missions.arlanda_hist.id,
      teamId: teams.nova.id,
      authorId: erik.id,
      areasSearched: "Terminal 5, bagagehall samt angränsande lastutrymme.",
      areaSize: 25000,
      findings: "1 paket – Narkotika (Cannabis), cirka 400 gram.",
      deviations: "Inga",
      actions: "Överlämnat till polis på plats. Kvitto nummer 41221 erhållet.",
      comment:
        "Bra samarbete. Hunden visade tydligt intresse vid bagageband 7. Markering bekräftad av kontrollant.",
      startedAt: at(-10, 8, 0),
      endedAt: at(-10, 10, 20),
      status: "APPROVED",
      submittedAt: at(-10, 11, 0),
      approvedById: karin.id,
      approvedAt: at(-9, 9, 30),
      createdAt: at(-10, 10, 45),
      indications: {
        create: [
          {
            location: "Bagageband 3, kolli 18",
            description: "Tydlig och kvarstående markering på resväska.",
            outcome: "FIND",
            handedOverTo: "Polis, region Stockholm",
            sortOrder: 1,
          },
          {
            location: "Lastpall vid port 2",
            description: "Markering utan fynd vid kontroll.",
            outcome: "NO_FIND",
            sortOrder: 2,
          },
        ],
      },
    },
  });

  await db.operationalReport.create({
    data: {
      missionId: missions.lager_hist.id,
      teamId: teams.rex.id,
      authorId: erik.id,
      areasSearched: "Lagerhall A och B, samtliga ställage samt lastkaj.",
      areaSize: 4200,
      findings: "Inga fynd.",
      deviations: "Port 4 gick inte att öppna, avsnittet kunde inte genomsökas.",
      actions: "Avvikelsen rapporterad till lagerchef Tomas Ek.",
      comment: "Jämnt arbetstempo genom hela passet. Ny genomsökning av port 4 bokas.",
      startedAt: at(-17, 13, 0),
      endedAt: at(-17, 15, 45),
      status: "APPROVED",
      submittedAt: at(-17, 16, 30),
      approvedById: karin.id,
      approvedAt: at(-16, 8, 15),
      createdAt: at(-17, 16, 20),
    },
  });

  await db.operationalReport.create({
    data: {
      missionId: missions.malmo_hist.id,
      teamId: teams.mira.id,
      authorId: sofie.id,
      areasSearched: "Inkommande gods, container 1–14.",
      areaSize: 1800,
      findings: "1 fynd – misstänkt narkotika i container 9.",
      deviations: "Inga",
      actions: "Godset avskilt och överlämnat till Tullverket.",
      comment: "Hunden markerade tidigt på container 9. Tullverket på plats inom en timme.",
      startedAt: at(-21, 9, 0),
      endedAt: at(-21, 12, 30),
      status: "SUBMITTED",
      submittedAt: at(-21, 13, 10),
      createdAt: at(-21, 12, 55),
      indications: {
        create: [
          {
            location: "Container 9, bakre vänstra hörnet",
            description: "Markering på pallkrage.",
            outcome: "FIND",
            handedOverTo: "Tullverket",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await db.comment.create({
    data: {
      authorId: karin.id,
      reportId: report1.id,
      body: "Tydlig rapport. Bra att kvittonummer finns med.",
      createdAt: at(-9, 9, 35),
    },
  });

  // ------------------------------------------------------------ Uppföljning
  await db.followUp.create({
    data: {
      teamId: teams.nova.id,
      instructorId: anna.id,
      title: "Uppföljning höga gömmor",
      message:
        "Vi tar ett gemensamt pass på höga gömmor innan certifieringen. Hör av dig med tid som passar.",
      dueDate: at(9),
      status: "OPEN",
    },
  });

  // ---------------------------------------------------------- Notifieringar
  console.log("Skapar notifieringar …");
  const notifications = [
    {
      userId: erik.id, type: "MISSION_ASSIGNED",
      title: "Nytt uppdrag: Evenemangssök",
      body: "Friends Arena, Solna – 14:30. Svara ja eller nej i uppdragsvyn.",
      url: `/uppdrag/${missions.friends.id}`, createdAt: at(-1, 15, 20),
    },
    {
      userId: erik.id, type: "COMMENT",
      title: "Anna Karlsson kommenterade din träning",
      body: "Bra jobbat! Fortsätt nöta på uthålligheten.",
      url: `/traning/${createdSessions["nova-0"]}`, createdAt: at(-8, 9, 15),
    },
    {
      userId: erik.id, type: "FOLLOW_UP",
      title: "Kallelse till uppföljning",
      body: "Anna Karlsson vill följa upp höga gömmor.",
      url: "/traning", createdAt: at(-2, 10, 0),
    },
    {
      userId: erik.id, type: "SESSION_APPROVED",
      title: "Träning godkänd",
      body: "Områdessök – Skog, Tyresta är godkänt.",
      url: `/traning/${createdSessions["nova-0"]}`,
      readAt: at(-7, 8, 0), createdAt: at(-8, 12, 0),
    },
    {
      userId: johan.id, type: "CERT_EXPIRING",
      title: "Behörighet löper ut",
      body: "Auktoriserat ekipage för Balder går ut om 2 dagar.",
      url: "/certifikat", createdAt: at(-1, 7, 0),
    },
    {
      userId: anna.id, type: "COMMENT",
      title: "Nytt träningspass att granska",
      body: "Erik Andersson har skickat in Fordonssök – Fordon.",
      url: "/instruktor", createdAt: at(-3, 18, 40),
    },
    {
      userId: karin.id, type: "COMMENT",
      title: "Ny rapport inskickad",
      body: "Sofie Holm har skickat in rapport för UPP-2422.",
      url: "/rapporter", createdAt: at(-21, 13, 15),
    },
  ];
  for (const n of notifications) await db.notification.create({ data: n });

  console.log("\nKlart. Inloggningsuppgifter (lösenord för samtliga: %s)", PASSWORD);
  console.table([
    { Roll: "Hundförare", "E-post": erik.email, Namn: erik.name },
    { Roll: "Hundförare", "E-post": johan.email, Namn: johan.name },
    { Roll: "Instruktör", "E-post": anna.email, Namn: anna.name },
    { Roll: "Regionalt ansvarig", "E-post": karin.email, Namn: karin.name },
    { Roll: "Nationellt ansvarig", "E-post": magnus.email, Namn: magnus.name },
    { Roll: "Administratör", "E-post": admin.email, Namn: admin.name },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
