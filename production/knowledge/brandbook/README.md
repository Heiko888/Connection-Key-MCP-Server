# Master Brand Book - Knowledge-Dateien

## Ãœbersicht

Dieses Verzeichnis enthÃ¤lt die konvertierten Knowledge-Dateien aus dem Master Brand Book.

## Dateien

- randbook-kapitel-01.txt - Kapitel 01
- randbook-kapitel-02.txt - Kapitel 02
- randbook-kapitel-03.txt - Kapitel 03
- randbook-kapitel-04.txt - Kapitel 04
- randbook-kapitel-05.txt - Kapitel 05
- randbook-kapitel-06.txt - Kapitel 06
- randbook-kapitel-07.txt - Kapitel 07
- randbook-kapitel-08.txt - Kapitel 08
- randbook-kapitel-09.txt - Kapitel 09
- randbook-kapitel-10.txt - Kapitel 10
- randbook-kapitel-11.txt - Kapitel 11
- randbook-kapitel-12.txt - Kapitel 12
- randbook-kapitel-13.txt - Kapitel 13
- randbook-kapitel-14.txt - Kapitel 14
- randbook-kapitel-15.txt - Kapitel 15
- randbook-kapitel-16.txt - Kapitel 16
- randbook-kapitel-17.txt - Kapitel 17
- randbook-kapitel-18.txt - Kapitel 18
- randbook-complete.md - VollstÃ¤ndiges Brand Book (Markdown)
## Verwendung

Diese Dateien werden automatisch von den Agenten geladen:
- **Reading Agent**: LÃ¤dt alle .txt und .md Dateien aus production/knowledge/
- **MCP Agenten**: KÃ¶nnen Ã¼ber System-Prompts auf diese Knowledge zugreifen

## Aktualisierung

Um die Knowledge-Dateien zu aktualisieren:
1. FÃ¼hren Sie dieses Script erneut aus
2. Starten Sie die Agenten neu oder laden Sie Knowledge neu:
   - Reading Agent: curl -X POST http://localhost:4001/admin/reload-knowledge
   - MCP Agenten: Neustart erforderlich

## Datum

Erstellt: 2025-12-11 01:34:55
