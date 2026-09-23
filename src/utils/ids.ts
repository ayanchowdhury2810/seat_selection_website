let counter = 0;

export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}-${Date.now()}`;
}

export function generateSectionId(index: number): string {
  return `section-gen-${index}`;
}

export function generateRowId(sectionIndex: number, rowIndex: number): string {
  return `row-gen-${sectionIndex}-${rowIndex}`;
}

export function generateSeatId(
  sectionIndex: number,
  rowIndex: number,
  seatIndex: number
): string {
  return `seat-gen-${sectionIndex}-${rowIndex}-${seatIndex}`;
}
