/** Normalize US phone input to E.164. MVP: US numbers only. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (input.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

/** Mask phone for display: +15035550101 → +1 •••-•••-0101 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last4 = digits.slice(-4);
    const country = phone.startsWith("+") ? `+${digits.slice(0, digits.length - 10)} ` : "";
    return `${country}•••-•••-${last4}`.trim();
  }
  return "•••-•••-••••";
}

/** Format E.164 for input display: +15035550101 → (503) 555-0101 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return phone;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}