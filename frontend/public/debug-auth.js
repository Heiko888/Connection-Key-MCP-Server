/**
 * 🔍 Debug-Helper für Auth & Dashboard Tests
 * 
 * Verwendung:
 * 1. Öffne Browser Console (F12)
 * 2. Kopiere diesen gesamten Code in die Console
 * 3. Oder lade diese Datei: <script src="/debug-auth.js"></script>
 */

(function() {
  'use strict';

  // ✅ Globale Debug-Funktionen
  window.debugAuth = {
    // Zeige aktuellen Auth-Status
    status: function() {
      console.log('%c=== 🔍 AUTH STATUS ===', 'color: #F29F05; font-weight: bold; font-size: 14px');
      console.log('📦 User Package:', localStorage.getItem('userPackage') || '❌ Nicht gesetzt');
      console.log('🆔 User ID:', localStorage.getItem('userId') || '❌ Nicht gesetzt');
      console.log('📧 User Email:', localStorage.getItem('userEmail') || '❌ Nicht gesetzt');
      console.log('🔑 Token:', localStorage.getItem('token') ? '✅ Vorhanden' : '❌ Fehlt');
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          console.log('👤 User Data:', parsed);
        } catch (e) {
          console.error('❌ User Data: Parse Error', e);
        }
      } else {
        console.log('👤 User Data: ❌ Nicht vorhanden');
      }
      
      console.log('%c=== ENDE AUTH STATUS ===', 'color: #F29F05; font-weight: bold;');
    },
    
    // Prüfe Paket-Konsistenz
    checkPackage: function() {
      console.log('%c=== 📦 PACKAGE CHECK ===', 'color: #F29F05; font-weight: bold; font-size: 14px');
      
      const userPackage = localStorage.getItem('userPackage');
      const userData = localStorage.getItem('userData');
      
      console.log('📦 localStorage userPackage:', userPackage || '❌ Nicht gesetzt');
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          const subscriptionPlan = parsed.subscriptionPlan;
          console.log('📋 userData.subscriptionPlan:', subscriptionPlan || '❌ Nicht gesetzt');
          
          if (userPackage && subscriptionPlan) {
            const isConsistent = userPackage === subscriptionPlan;
            console.log(
              isConsistent 
                ? '%c✅ Pakete sind konsistent' 
                : '%c❌ Pakete sind NICHT konsistent',
              isConsistent ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;'
            );
          } else {
            console.log('%c⚠️ Kann nicht verglichen werden (fehlende Daten)', 'color: orange;');
          }
        } catch (e) {
          console.error('❌ User Data: Parse Error', e);
        }
      } else {
        console.log('👤 User Data: ❌ Nicht vorhanden');
      }
      
      console.log('%c=== ENDE PACKAGE CHECK ===', 'color: #F29F05; font-weight: bold;');
    },
    
    // Clear alles (für Clean Test)
    clear: function() {
      if (confirm('⚠️ Möchtest du wirklich localStorage leeren und die Seite neu laden?')) {
        localStorage.clear();
        console.log('%c✅ localStorage geleert', 'color: green; font-weight: bold;');
        location.reload();
      }
    },
    
    // Zähle Dashboard-Renderings
    countRenders: function() {
      let count = 0;
      const originalLog = console.log;
      
      console.log('%c🔍 Render-Counter aktiviert!', 'color: #F29F05; font-weight: bold;');
      console.log('Login → Dashboard und beobachte die Console.');
      
      console.log = function(...args) {
        const message = args[0];
        if (typeof message === 'string' && message.includes('Dashboard wird geladen')) {
          count++;
          originalLog(
            '%c🔍 DASHBOARD RENDER COUNT: ' + count,
            'color: ' + (count === 1 ? 'green' : 'red') + '; font-weight: bold; font-size: 14px;',
            ...args.slice(1)
          );
        } else {
          originalLog.apply(console, args);
        }
      };
      
      // Reset nach 30 Sekunden
      setTimeout(() => {
        console.log = originalLog;
        console.log(
          '%c✅ Render-Counter beendet. Finaler Count: ' + count,
          'color: ' + (count === 1 ? 'green' : 'red') + '; font-weight: bold;'
        );
      }, 30000);
    },
    
    // Monitor API-Calls
    monitorAPI: function() {
      const originalFetch = window.fetch;
      const calls = new Map();
      
      console.log('%c🔍 API-Monitor aktiviert!', 'color: #F29F05; font-weight: bold;');
      
      window.fetch = function(...args) {
        const url = args[0];
        const key = typeof url === 'string' ? url : url.url;
        
        if (key.includes('/api/') || key.includes('supabase')) {
          const count = (calls.get(key) || 0) + 1;
          calls.set(key, count);
          
          if (count > 1) {
            console.warn(
              '%c⚠️ MEHRFACHER API-CALL: ' + key + ' (' + count + '×)',
              'color: red; font-weight: bold;'
            );
          } else {
            console.log(
              '%c✅ API-CALL: ' + key,
              'color: green;'
            );
          }
        }
        
        return originalFetch.apply(this, args);
      };
      
      // Reset nach 30 Sekunden
      setTimeout(() => {
        window.fetch = originalFetch;
        console.log('%c✅ API-Monitor beendet', 'color: #F29F05; font-weight: bold;');
        console.log('Zusammenfassung:', Array.from(calls.entries()));
      }, 30000);
    },
    
    // Vollständiger Test-Report
    report: function() {
      console.log('%c=== 📊 VOLLSTÄNDIGER TEST-REPORT ===', 'color: #F29F05; font-weight: bold; font-size: 16px;');
      
      this.status();
      console.log('');
      this.checkPackage();
      console.log('');
      
      // Prüfe auf bekannte Probleme
      console.log('%c=== 🔍 PROBLEM-CHECKS ===', 'color: #F29F05; font-weight: bold;');
      
      const userPackage = localStorage.getItem('userPackage');
      const profileSetupCompleted = localStorage.getItem('profileSetupCompleted');
      
      if (profileSetupCompleted) {
        console.warn('%c⚠️ Veraltetes Flag gefunden: profileSetupCompleted', 'color: orange;');
      }
      
      if (!userPackage) {
        console.error('%c❌ userPackage fehlt in localStorage', 'color: red; font-weight: bold;');
      } else if (!['basic', 'premium', 'vip', 'admin'].includes(userPackage)) {
        console.error('%c❌ Ungültiges Paket: ' + userPackage, 'color: red; font-weight: bold;');
      } else {
        console.log('%c✅ Paket ist gültig: ' + userPackage, 'color: green; font-weight: bold;');
      }
      
      console.log('%c=== ENDE TEST-REPORT ===', 'color: #F29F05; font-weight: bold;');
    },
    
    // Hilfe anzeigen
    help: function() {
      console.log('%c=== 🔍 DEBUG AUTH - HILFE ===', 'color: #F29F05; font-weight: bold; font-size: 14px;');
      console.log('');
      console.log('Verfügbare Commands:');
      console.log('');
      console.log('  %cdebugAuth.status()%c        → Zeige Auth-Status', 'color: cyan;', 'color: white;');
      console.log('  %cdebugAuth.checkPackage()%c   → Prüfe Paket-Konsistenz', 'color: cyan;', 'color: white;');
      console.log('  %cdebugAuth.clear()%c         → Clear localStorage & Reload', 'color: cyan;', 'color: white;');
      console.log('  %cdebugAuth.countRenders()%c  → Zähle Dashboard-Renderings', 'color: cyan;', 'color: white;');
      console.log('  %cdebugAuth.monitorAPI()%c    → Monitor API-Calls', 'color: cyan;', 'color: white;');
      console.log('  %cdebugAuth.report()%c        → Vollständiger Test-Report', 'color: cyan;', 'color: white;');
      console.log('  %cdebugAuth.help()%c          → Diese Hilfe', 'color: cyan;', 'color: white;');
      console.log('');
      console.log('%c=== ENDE HILFE ===', 'color: #F29F05; font-weight: bold;');
    }
  };

  // ✅ Automatisch Hilfe anzeigen beim Laden
  console.log('%c=== ✅ DEBUG AUTH HELPER GELADEN ===', 'color: green; font-weight: bold; font-size: 16px;');
  console.log('Tipp: Gib %cdebugAuth.help()%c ein für alle verfügbaren Commands', 'color: cyan; font-weight: bold;', 'color: white;');
  
})();

