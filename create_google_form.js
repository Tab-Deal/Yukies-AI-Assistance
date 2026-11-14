/**
 * Google Apps Script to automatically generate the YUKIES Feedback Form
 * How to use:
 * 1. Open https://script.google.com/
 * 2. Click "New project"
 * 3. Replace all code with this script and click "Run" (▶)
 * 4. Grant permission. The live Google Form URL and Edit URL will be printed in the Execution Log!
 */

function createYukiesQuestionnaire() {
  const form = FormApp.create('YUKIES WIEN – Fragenkatalog für Silvia & Barbara');
  form.setDescription(
    'Liebe Silvia, liebe Barbara,\n\n' +
    'unser YUKIES KI-Shopping-Assistent läuft bereits auf yukies.at. Damit er noch natürlicher berät und offene Fragen eigenständig beantwortet, bitten wir euch um Beantwortung dieses kurzen Fragebogens.\n\nVielen Dank!'
  );

  // Section 1
  form.addSectionHeaderItem().setTitle('Teil 1: Die 5 offenen Kernpunkte (Wissensbasis)');

  form.addParagraphTextItem()
    .setTitle('1. Body Butter Shea Coco – Anwendung & Dosierung')
    .setHelpText('Wie oft (z. B. 1–2x täglich, nach dem Duschen auf feuchter Haut) und wie viel (z. B. haselnussgroße Menge) sollte pro Anwendung empfohlen werden?')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('2. B2B & Händleranfragen (Boutiquen, Hebammen, Concept Stores)')
    .setHelpText('Gibt es eine Mindestbestellmenge? An welche E-Mail-Adresse oder an wen persönlich (Silvia / Barbara) soll der Assistent B2B-Partnerinnen verweisen?')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('3. Versand außerhalb der EU (Schweiz, UK etc.)')
    .setHelpText('Versenden wir in die Schweiz und nach UK? Wie hoch sind die Versandkosten, wie lange dauert es ca. und wer trägt eventuelle Zollgebühren?')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('4. Eindeutige Namen für die Sets (Y-SET-4 und Y-SET-5)')
    .setHelpText('Aktuell heißen beide Sets „Babyparty“. Wie sollen die beiden Sets heißen? (z. B. Großes Set vs. Mini-Duo?)')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('5. Black Week 2026 – Finale Bestätigung der Staffel-Aktion')
    .setHelpText('Ist die Staffelung (ab 50 € Bürste, ab 80 € Bürste+Wash, ab 120 € alle drei) bestätigt? Gilt 23.–27. Nov oder bis 30. Nov?')
    .setRequired(true);

  // Section 2
  form.addSectionHeaderItem().setTitle('Teil 2: Beratungs-Rituale & Empfehlungen');

  form.addParagraphTextItem()
    .setTitle('6. Das beste Schwangerschafts-Ritual')
    .setHelpText('Welche Kombination empfiehlt ihr für morgens vs. abends? (z. B. morgens Tummy Stick, abends Body Butter?)')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('7. Die ersten 14 Tage nach der Geburt')
    .setHelpText('Welches Produkt ist eure Empfehlung Nr. 1 für die allerersten Lebenstage des Babys? (z. B. Babyöl Mandel-Kokos zur Reinigung des Windelbereichs?)')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('8. Trockenbürste – Empfehlung')
    .setHelpText('Wie oft pro Woche anwenden? Auch am Bauch in der Schwangerschaft oder nur Beine/Arme/Po?')
    .setRequired(false);

  // Section 3
  form.addSectionHeaderItem().setTitle('Teil 3: Feedback zum neuen Design');

  form.addParagraphTextItem()
    .setTitle('9. Feedback zum runden Vogel-Logo Launcher und dem Begrüßungsfenster')
    .setHelpText('Gefällt euch das neue Design mit dem dunkelblauen Vogel-Logo und dem 5-Sekunden-Pop-up?')
    .setRequired(false);

  Logger.log('Published Form URL: ' + form.getPublishedUrl());
  Logger.log('Edit Form URL: ' + form.getEditUrl());
}
