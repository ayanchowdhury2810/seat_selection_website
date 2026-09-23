import type { Seat, SeatSection } from "./seat-types";

export class SeatSelectionState {
  private selected: Set<string> = new Set();
  private hover: string | null = null;

  select(objectId: string): void {
    this.selected.add(objectId);
  }

  deselect(objectId: string): void {
    this.selected.delete(objectId);
  }

  toggle(objectId: string): void {
    if (this.selected.has(objectId)) {
      this.deselect(objectId);
    } else {
      this.select(objectId);
    }
  }

  isSelected(objectId: string): boolean {
    return this.selected.has(objectId);
  }

  clear(): void {
    this.selected.clear();
  }

  getSelected(): Set<string> {
    return new Set(this.selected);
  }

  getSelectedArray(): string[] {
    return Array.from(this.selected);
  }

  getSelectedCount(): number {
    return this.selected.size;
  }

  setHover(objectId: string | null): void {
    this.hover = objectId;
  }

  getHover(): string | null {
    return this.hover;
  }
}
