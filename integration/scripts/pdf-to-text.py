#!/usr/bin/env python3
"""
Extrahiert Text aus PDF-Dateien
Verwendung: python pdf-to-text.py <pdf-datei> [<ausgabe-datei>]
"""

import sys
import os

def extract_text_from_pdf(pdf_path):
    """Extrahiert Text aus einer PDF-Datei"""
    try:
        # Versuche PyPDF2
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except ImportError:
            pass
        
        # Versuche pdfplumber
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
                    text += "\n"
            return text
        except ImportError:
            pass
        
        # Versuche pypdf (neueste Version)
        try:
            from pypdf import PdfReader
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except ImportError:
            try:
                import pypdf
                with open(pdf_path, 'rb') as file:
                    reader = pypdf.PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                    return text
            except ImportError:
                pass
        
        # Fallback: Warnung
        return f"[WARNUNG: Keine PDF-Bibliothek installiert. Bitte installieren Sie eine von: PyPDF2, pdfplumber, oder pypdf]\n\nDatei: {os.path.basename(pdf_path)}"
        
    except Exception as e:
        return f"[FEHLER beim Lesen der PDF: {str(e)}]\n\nDatei: {os.path.basename(pdf_path)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Verwendung: python pdf-to-text.py <pdf-datei> [<ausgabe-datei>]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(f"FEHLER: Datei nicht gefunden: {pdf_path}")
        sys.exit(1)
    
    text = extract_text_from_pdf(pdf_path)
    
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Text extrahiert nach: {output_path}")
    else:
        print(text)

