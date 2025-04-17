// Code Google Apps Script à déployer comme application web
// Ce code doit être copié dans l'éditeur de script de Google Sheets

function doPost(e) {
    try {
        // ID de votre Google Sheet (à remplacer par votre ID)
        // L'ID se trouve dans l'URL de votre Google Sheet: https://docs.google.com/spreadsheets/d/ID_DU_SHEET/edit
        const sheetID = '1uq8bGoFpuWSoMJQTgjCAFtWbcBgUahSwWWD3BIzA4_4';
        const sheet = SpreadsheetApp.openById(sheetID).getSheetByName('Inscriptions');

        // Récupérer les données du formulaire
        const data = e.parameter;

        // Formater les données pour l'insertion
        const rowData = [
            data.dateInscription || new Date().toLocaleString('fr-FR'),
            data.nom || '',
            data.prenom || '',
            data.email || '',
            data.creneau || '',
            'Inscrit' // Statut par défaut
        ];

        // Ajouter les données à la feuille Google Sheet
        sheet.appendRow(rowData);

        // Répondre avec un succès
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Inscription enregistrée avec succès' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // En cas d'erreur, répondre avec un message d'erreur
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Cette fonction est obligatoire pour activer CORS
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Le service est actif' }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Instructions de déploiement:
// 1. Connectez-vous à votre compte Google
// 2. Ouvrez votre Google Sheet
// 3. Cliquez sur Extensions > Apps Script
// 4. Copiez-collez ce code dans l'éditeur
// 5. Enregistrez le projet (donnez-lui un nom comme "SpeakToLeadInscriptions")
// 6. Cliquez sur Déployer > Nouveau déploiement
// 7. Sélectionnez "Application web" comme type de déploiement
// 8. Description: "API d'inscription Speak to Lead"
// 9. Définir l'accès:
//    - Exécuter en tant que: Moi (votre compte Google)
//    - Qui a accès: Tout le monde (anyone, even anonymous)
// 10. Cliquez sur "Déployer"
// 11. Copiez l'URL générée et utilisez-la comme valeur pour scriptURL dans le HTML 