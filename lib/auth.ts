import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  timezone?: string;
}) {
  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
      name: data.name,
      timezone: data.timezone || "UTC",
    },
  });
}

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name, timezone: user.timezone };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, timezone: true, createdAt: true },
  });
  return user;
}
