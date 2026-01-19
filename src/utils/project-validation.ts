/**
 * Valida se uma cor está no formato hexadecimal #RRGGBB
 *
 * @param color - String da cor a ser validada
 * @returns true se válida, false caso contrário
 *
 * @example
 * validateHexColor('#FF5733') // true
 * validateHexColor('#fff') // false
 * validateHexColor('FF5733') // false
 */
export function validateHexColor(color: string): boolean {
   const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
   return hexColorRegex.test(color);
}

/**
 * Valida se o intervalo de datas é válido (início < fim)
 *
 * @param dataInicio - Data de início (opcional)
 * @param dataFim - Data de fim (opcional)
 * @returns true se válido ou se ambas forem undefined, false caso contrário
 *
 * @example
 * validateDateRange(new Date('2024-01-01'), new Date('2024-12-31')) // true
 * validateDateRange(new Date('2024-12-31'), new Date('2024-01-01')) // false
 * validateDateRange(undefined, undefined) // true
 */
export function validateDateRange(
  dataInicio?: Date | null,
  dataFim?: Date | null
): boolean {
  if (!dataInicio || !dataFim) return true;

  return new Date(dataInicio).getTime() < new Date(dataFim).getTime();
}

/**
 * Normaliza uma string para busca case-insensitive
 * Remove acentos e converte para minúsculas
 *
 * @param text - Texto a ser normalizado
 * @returns Texto normalizado
 */
 export function normalizeSearchText(text: string): string {
   return text
     .toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '');
 }
