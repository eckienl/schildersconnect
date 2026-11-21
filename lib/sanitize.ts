/**
 * Before a match, painter and customer may not exchange contact details,
 * otherwise the match fee is skipped. Strip e-mail, phone numbers and links.
 */
export function stripContact(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[verborgen]')
    .replace(/(https?:\/\/|www\.)\S+/gi, '[verborgen]')
    .replace(/(\+?\d[\d\s\-().]{7,}\d)/g, '[verborgen]');
}

export function shortPostcode(pc: string) {
  return (pc || '').replace(/\s/g, '').slice(0, 4);
}

export function clean(v: FormDataEntryValue | null, max = 2000) {
  return String(v ?? '').trim().slice(0, max);
}
