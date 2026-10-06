# 🚒 Feuerwehr Einsatzleiter

Ein browserbasiertes 3D-Feuerwehrspiel als Prototyp.

## Start

Die Webseite kann direkt über GitHub Pages veröffentlicht werden.

1. Repository auf GitHub erstellen.
2. Alle Dateien hochladen.
3. `Settings → Pages` öffnen.
4. Als Quelle `Deploy from a branch` wählen.
5. Branch `main`, Ordner `/ (root)` auswählen.

## Aktueller Prototyp

- Startmenü: Freies Spiel / Einsätze
- Gemeinsame 3D-Stadtkarte mit Wache, Straßen, Gebäuden und Wald
- 15 Fahrzeuge in der Fahrzeugdatenbank
- klickbare Garagentore mit direkter Fahrzeugauswahl
- fünf Einsätze mit eigenen Orten und passenden 3D-Elementen: Mülltonnenbrand, Wohnungsbrand, Waldbrand, Verkehrsunfall und Einkaufszentrum
- mehrere Fahrzeuge auswählen und alarmieren; einfache 3D-Fahrzeugmodelle fahren mit Blaulicht vom Gerätehaus zum Einsatz
- ausgerücktes Fahrzeug per Klick auf eine Straße positionieren
- kurzes synthetisches Einsatzsignal bei der Alarmierung
- zehnminütige Bereitschaftsuhr im freien Spiel

## Nächste Ausbaustufen

1. echte GLB/GLTF-Fahrzeugmodelle
2. größere, frei erkundbare Karten mit mehr Einsatzorten
3. realistischeres Straßenrouting und Fahrzeugverhalten
4. Hydranten- und Schlauchphysik mit verschiedenen Schlauchtypen
5. animierter DLK-Ausleger und Personenrettung
6. realistische Einsatzkräfte und Animationen
7. eigene Einsätze erstellen


## Bedienlogik

- **Freies Spiel:** öffnet die 3D-Karte und startet die zehnminütige Bereitschaft. Einsätze lassen sich anschließend über den Einsatz-Button auswählen.
- **Einsätze:** öffnet die Einsatzliste. Nach der Auswahl zeigt die Karte den jeweiligen Einsatzort und passende 3D-Elemente.
- **Alarmierung:** Fahrzeuge können einzeln über ein Garagentor oder gesammelt über die Fahrzeugliste alarmiert werden. Sie rücken sichtbar zum Einsatzort aus.
- **Positionierung:** nach der Alarmierung lässt sich das zuletzt ausgerückte Fahrzeug auf einer Straße abstellen.


## Fehlerbehebung v3

Die Browser-Auflösung von Three.js/OrbitControls wurde über eine Import Map korrigiert. Dadurch funktionieren die Menü-Buttons auch auf GitHub Pages korrekt.
