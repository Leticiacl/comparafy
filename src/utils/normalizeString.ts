// src/utils/normalizeString.ts
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')                 // separa caracteres base + diacríticos
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/ç/g, 'c')               // normaliza ç→c
    .trim()
}
