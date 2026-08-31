import { redirect } from "next/navigation";
import { db } from "../../src/prisma/db";
import { auth } from "./server";
type AuthUserShape = {
  id?: string;
  email?: string | null;
  name?: string | null;
};
export async function getCurrentAuthUser(): Promise<AuthUserShape | null> {
  const result = await auth.getSession();
  const value = result as unknown as {
    data?: {
      user?: AuthUserShape | null;
      session?: unknown;
    } | null;
    user?: AuthUserShape | null;
    session?: unknown;
  };
  return (value.data?.user ??
    value.user ??
    null);
}
export async function getCurrentAppUser() {
  const authUser = await getCurrentAuthUser();
  if (!authUser?.email) {
    return null;
  }
  const email = authUser.email
    .trim()
    .toLowerCase();
  let user = await db.orm.public.User
    .where({
      email
    })
    .first();
  if (!user) {
    user =
      await db.orm.public.User.create({
        email,
        name: authUser.name?.trim() ||
          null,
        username: null
      });
    return user;
  }
  const authName = authUser.name?.trim() ||
    null;
  if (authName &&
    String(user.name || "") !== authName) {
    const updated = await db.orm.public.User
      .where({
        id: Number(user.id)
      })
      .update({
        name: authName
      });
    if (updated) {
      user =
        updated;
    }
  }
  return user;
}
export async function requireCurrentAppUser() {
  const user = await getCurrentAppUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
