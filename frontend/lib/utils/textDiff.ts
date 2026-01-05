/**
 * Text Diff Utilities
 * Einfache Zeilen-basierte Diff-Funktion für Text-Vergleiche
 */

export interface DiffLine {
  type: 'equal' | 'added' | 'removed';
  content: string;
  lineNumber?: number;
}

/**
 * Vergleicht zwei Texte zeilenweise und gibt Diff-Informationen zurück
 */
export function diffText(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diff: DiffLine[] = [];

  // Einfacher Algorithmus: Zeile für Zeile vergleichen
  const maxLines = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined && newLine !== undefined) {
      // Neue Zeile hinzugefügt
      diff.push({
        type: 'added',
        content: newLine,
        lineNumber: i + 1,
      });
    } else if (oldLine !== undefined && newLine === undefined) {
      // Zeile entfernt
      diff.push({
        type: 'removed',
        content: oldLine,
        lineNumber: i + 1,
      });
    } else if (oldLine === newLine) {
      // Zeile unverändert
      diff.push({
        type: 'equal',
        content: oldLine,
        lineNumber: i + 1,
      });
    } else {
      // Zeile geändert: erst entfernt, dann hinzugefügt
      diff.push({
        type: 'removed',
        content: oldLine,
        lineNumber: i + 1,
      });
      diff.push({
        type: 'added',
        content: newLine,
        lineNumber: i + 1,
      });
    }
  }

  return diff;
}

/**
 * Zählt die Anzahl der Unterschiede
 */
export function countDifferences(diff: DiffLine[]): { added: number; removed: number; changed: number } {
  let added = 0;
  let removed = 0;
  let changed = 0;

  for (let i = 0; i < diff.length; i++) {
    const line = diff[i];
    if (line.type === 'added') {
      added++;
      // Prüfe ob vorherige Zeile entfernt wurde (dann ist es eine Änderung)
      if (i > 0 && diff[i - 1].type === 'removed' && diff[i - 1].lineNumber === line.lineNumber) {
        changed++;
        added--;
        removed--;
      }
    } else if (line.type === 'removed') {
      removed++;
    }
  }

  return { added, removed, changed };
}

