#!/bin/bash

# Prüft ob Task-Routen auf Server vorhanden sind
# Server: 167.235.224.149

set -e

SERVER="167.235.224.149"
SERVER_USER="root"
FRONTEND_PATH="/opt/hd-app/The-Connection-Key/frontend"

echo "🔍 Prüfe Task-Routen auf Server $SERVER..."
echo ""

# SSH-Befehl ausführen
ssh $SERVER_USER@$SERVER << 'ENDSSH'
  echo "📁 Prüfe Frontend-Verzeichnis..."
  cd /opt/hd-app/The-Connection-Key/frontend || {
    echo "❌ Frontend-Verzeichnis nicht gefunden!"
    exit 1
  }

  echo ""
  echo "✅ Frontend-Verzeichnis gefunden"
  echo ""

  # Prüfe Task-Route (User-facing)
  echo "📄 Prüfe /api/agents/tasks Route..."
  if [ -f "app/api/agents/tasks/route.ts" ]; then
    echo "✅ Route gefunden: app/api/agents/tasks/route.ts"
    echo "   Zeilen: $(wc -l < app/api/agents/tasks/route.ts)"
    echo "   Größe: $(du -h app/api/agents/tasks/route.ts | cut -f1)"
  else
    echo "❌ Route NICHT gefunden: app/api/agents/tasks/route.ts"
  fi

  echo ""

  # Prüfe System Task-Route
  echo "📄 Prüfe /api/system/agents/tasks Route..."
  if [ -f "app/api/system/agents/tasks/route.ts" ]; then
    echo "✅ Route gefunden: app/api/system/agents/tasks/route.ts"
    echo "   Zeilen: $(wc -l < app/api/system/agents/tasks/route.ts)"
    echo "   Größe: $(du -h app/api/system/agents/tasks/route.ts | cut -f1)"
  else
    echo "❌ Route NICHT gefunden: app/api/system/agents/tasks/route.ts"
  fi

  echo ""

  # Prüfe TaskManager
  echo "📄 Prüfe TaskManager..."
  if [ -f "lib/agent/task-manager.ts" ]; then
    echo "✅ TaskManager gefunden: lib/agent/task-manager.ts"
    echo "   Zeilen: $(wc -l < lib/agent/task-manager.ts)"
    echo "   Größe: $(du -h lib/agent/task-manager.ts | cut -f1)"
  else
    echo "❌ TaskManager NICHT gefunden: lib/agent/task-manager.ts"
  fi

  echo ""

  # Prüfe Verzeichnisstruktur
  echo "📁 Verzeichnisstruktur:"
  echo "   app/api/agents/tasks/:"
  ls -la app/api/agents/tasks/ 2>/dev/null || echo "   ❌ Verzeichnis existiert nicht"
  echo ""
  echo "   app/api/system/agents/tasks/:"
  ls -la app/api/system/agents/tasks/ 2>/dev/null || echo "   ❌ Verzeichnis existiert nicht"
  echo ""
  echo "   lib/agent/:"
  ls -la lib/agent/ 2>/dev/null || echo "   ❌ Verzeichnis existiert nicht"

  echo ""
  echo "✅ Prüfung abgeschlossen"
ENDSSH

echo ""
echo "🎉 Prüfung beendet!"
