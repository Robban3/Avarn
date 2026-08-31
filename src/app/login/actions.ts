"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import type { Role } from "@/lib/domain";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Fyll i e-postadress").toLowerCase(),
  password: z.string().min(1, "Fyll i lösenord"),
  retur: z.string().optional(),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    retur: formData.get("retur"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kontrollera uppgifterna." };
  }

  const { email, password, retur } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Samma svar oavsett om kontot saknas eller lösenordet är fel, så att
  // inloggningsvyn inte avslöjar vilka adresser som finns.
  const genericError = "Fel e-postadress eller lösenord.";

  if (!user || !user.active) {
    await audit({
      action: "DENIED",
      entityType: "Login",
      detail: `Misslyckad inloggning för ${email}`,
    });
    return { error: genericError };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await audit({
      userId: user.id,
      action: "DENIED",
      entityType: "Login",
      detail: "Fel lösenord",
    });
    return { error: genericError };
  }

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    regionId: user.regionId,
  });

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await audit({ userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id });

  // Endast interna adresser accepteras som returmål.
  const target = retur && retur.startsWith("/") && !retur.startsWith("//") ? retur : "/hem";
  redirect(target);
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
