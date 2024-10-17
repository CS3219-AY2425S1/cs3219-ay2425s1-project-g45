import bcrypt from "bcrypt";

const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  plaintext: string,
  hashed: string
): Promise<Boolean> {
  return bcrypt.compare(plaintext, hashed);
}
