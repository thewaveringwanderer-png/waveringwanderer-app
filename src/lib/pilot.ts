export const PILOT_EMAILS = [
  'bigogita@gmail.com',
  'nddawson15@gmail.com',
  'mickid3@gmail.com',
  't.walls3806@gmail.com',
  'nahsspncr@gmail.com',
  'officialjt555@gmail.com',
  'anna@strangeaddiction.co.uk',
  'kofficialldn@gmail.com',
  'vanda500@hotmail.com',
  'tallulah.music@hotmail.com',
].map(e => e.trim().toLowerCase())

export function isPilotEmail(email: string | null | undefined) {
  const x = (email || '').trim().toLowerCase()
  return !!x && PILOT_EMAILS.includes(x)
}