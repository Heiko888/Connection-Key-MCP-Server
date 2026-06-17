#!/bin/bash
# A4 – Hard-Check Script
# Prüft automatisch, ob alle Legacy-Referenzen entfernt wurden

set -e

echo "🔥 A4 – Hard-Check: System-Konsolidierung"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# ============================================
# CHECK 1: CHATGPT_AGENT_URL
# ============================================
echo "🔍 CHECK 1: CHATGPT_AGENT_URL"
echo "----------------------------"
CHATGPT_AGENT_MATCHES=$(grep -r "CHATGPT_AGENT_URL" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude="*.md" \
  --exclude="*.sh" \
  --exclude="*.ps1" \
  2>/dev/null | wc -l || echo "0")

if [ "$CHATGPT_AGENT_MATCHES" -gt 0 ]; then
  echo "❌ FEHLER: CHATGPT_AGENT_URL noch in aktivem Code gefunden!"
  grep -r "CHATGPT_AGENT_URL" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude="*.md" \
    --exclude="*.sh" \
    --exclude="*.ps1" \
    2>/dev/null || true
  ERRORS=$((ERRORS + 1))
else
  echo "✅ OK: CHATGPT_AGENT_URL nicht in aktivem Code"
fi
echo ""

# ============================================
# CHECK 2: CK_AGENT_URL
# ============================================
echo "🔍 CHECK 2: CK_AGENT_URL"
echo "----------------------------"
CK_AGENT_MATCHES=$(grep -r "CK_AGENT_URL" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude="*.md" \
  --exclude="*.sh" \
  --exclude="*.ps1" \
  2>/dev/null | wc -l || echo "0")

if [ "$CK_AGENT_MATCHES" -gt 0 ]; then
  echo "❌ FEHLER: CK_AGENT_URL noch in aktivem Code gefunden!"
  grep -r "CK_AGENT_URL" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude="*.md" \
    --exclude="*.sh" \
    --exclude="*.ps1" \
    2>/dev/null || true
  ERRORS=$((ERRORS + 1))
else
  echo "✅ OK: CK_AGENT_URL nicht in aktivem Code"
fi
echo ""

# ============================================
# CHECK 3: chatgpt-agent (Docker Service)
# ============================================
echo "🔍 CHECK 3: chatgpt-agent (Docker Service)"
echo "----------------------------"
if grep -q "chatgpt-agent:" docker-compose.yml 2>/dev/null; then
  echo "❌ FEHLER: chatgpt-agent Service noch in docker-compose.yml!"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ OK: chatgpt-agent Service nicht in docker-compose.yml"
fi
echo ""

# ============================================
# CHECK 4: ck-agent (Docker Service)
# ============================================
echo "🔍 CHECK 4: ck-agent (Docker Service)"
echo "----------------------------"
if grep -q "ck-agent:" docker-compose.yml 2>/dev/null; then
  echo "⚠️  WARNUNG: ck-agent Service noch in docker-compose.yml (kann separate Datei sein)"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ OK: ck-agent Service nicht in docker-compose.yml"
fi
echo ""

# ============================================
# CHECK 5: Port 4000 in docker-compose.yml
# ============================================
echo "🔍 CHECK 5: Port 4000 in docker-compose.yml"
echo "----------------------------"
PORT_4000_MATCHES=$(grep -E "4000:4000|:\"4000\"" docker-compose.yml 2>/dev/null | wc -l || echo "0")

if [ "$PORT_4000_MATCHES" -gt 0 ]; then
  echo "❌ FEHLER: Port 4000 noch in docker-compose.yml exponiert!"
  grep -E "4000:4000|:\"4000\"" docker-compose.yml || true
  ERRORS=$((ERRORS + 1))
else
  echo "✅ OK: Port 4000 nicht in docker-compose.yml exponiert"
fi
echo ""

# ============================================
# CHECK 6: Hardcodierte IPs (138.199.237.34)
# ============================================
echo "🔍 CHECK 6: Hardcodierte IPs (138.199.237.34)"
echo "----------------------------"
HARDCODED_IP_MATCHES=$(grep -r "138.199.237.34" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude="*.md" \
  --exclude="*.sh" \
  --exclude="*.ps1" \
  2>/dev/null | grep -v "localhost:4000" | wc -l || echo "0")

if [ "$HARDCODED_IP_MATCHES" -gt 0 ]; then
  echo "⚠️  WARNUNG: Hardcodierte IPs gefunden (können in Dokumentation sein)"
  grep -r "138.199.237.34" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude="*.md" \
    --exclude="*.sh" \
    --exclude="*.ps1" \
    2>/dev/null | head -5 || true
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ OK: Keine hardcodierten IPs in aktivem Code"
fi
echo ""

# ============================================
# CHECK 7: READING_AGENT_URL vorhanden
# ============================================
echo "🔍 CHECK 7: READING_AGENT_URL verwendet"
echo "----------------------------"
READING_AGENT_MATCHES=$(grep -r "READING_AGENT_URL" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude="*.md" \
  2>/dev/null | wc -l || echo "0")

if [ "$READING_AGENT_MATCHES" -gt 0 ]; then
  echo "✅ OK: READING_AGENT_URL wird verwendet ($READING_AGENT_MATCHES Stellen)"
else
  echo "⚠️  WARNUNG: READING_AGENT_URL nicht gefunden"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
echo "=========================================="
echo "📊 ZUSAMMENFASSUNG"
echo "=========================================="
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo "🟢 STATUS: BESTANDEN"
  echo "   ✅ Keine Fehler"
  echo "   ✅ Keine Warnungen"
  echo ""
  echo "✅ System-Konsolidierung erfolgreich!"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo "🟡 STATUS: BESTANDEN (mit Warnungen)"
  echo "   ✅ Keine Fehler"
  echo "   ⚠️  $WARNINGS Warnung(en)"
  echo ""
  echo "⚠️  Bitte Warnungen prüfen"
  exit 0
else
  echo "🔴 STATUS: NICHT BESTANDEN"
  echo "   ❌ $ERRORS Fehler"
  echo "   ⚠️  $WARNINGS Warnung(en)"
  echo ""
  echo "❌ System-Konsolidierung unvollständig!"
  exit 1
fi
