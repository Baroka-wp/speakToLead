// Version améliorée du script Google Apps Script avec débogage
// Remplacez votre script actuel par celui-ci

function doPost(e) {
    try {
        // Journalisation des données reçues pour débogage
        Logger.log("Données reçues:");
        Logger.log(JSON.stringify(e.parameter));

        // ID de votre Google Sheet
        const sheetID = '1uq8bGoFpuWSoMJQTgjCAFtWbcBgUahSwWWD3BIzA4_4';

        try {
            // Vérifier si on peut ouvrir le fichier
            const ss = SpreadsheetApp.openById(sheetID);
            Logger.log("Accès au fichier réussi: " + ss.getName());

            // Vérifier si la feuille "Inscriptions" existe
            let sheet;
            try {
                sheet = ss.getSheetByName('Inscriptions');
                if (!sheet) {
                    // Si la feuille n'existe pas, la créer
                    Logger.log("Feuille 'Inscriptions' non trouvée, création en cours...");
                    sheet = ss.insertSheet('Inscriptions');

                    // Ajouter les en-têtes
                    sheet.appendRow([
                        "Date d'inscription",
                        "Nom",
                        "Prénom",
                        "Email",
                        "Créneau",
                        "Statut"
                    ]);
                    Logger.log("Feuille 'Inscriptions' créée avec succès");
                } else {
                    Logger.log("Feuille 'Inscriptions' trouvée");
                }
            } catch (sheetError) {
                Logger.log("Erreur lors de l'accès à la feuille: " + sheetError.toString());
                throw sheetError;
            }

            // Récupérer les données du formulaire
            const data = e.parameter;
            Logger.log("Données formatées pour insertion:");

            // Formater les données pour l'insertion
            const rowData = [
                data.dateInscription || new Date().toLocaleString('fr-FR'),
                data.nom || '',
                data.prenom || '',
                data.email || '',
                data.creneau || '',
                'Inscrit' // Statut par défaut
            ];

            Logger.log(rowData);

            // Ajouter les données à la feuille Google Sheet
            sheet.appendRow(rowData);
            Logger.log("Données ajoutées à la feuille avec succès");

            // Répondre avec un succès
            return ContentService
                .createTextOutput(JSON.stringify({
                    'result': 'success',
                    'message': 'Inscription enregistrée avec succès',
                    'data': rowData
                }))
                .setMimeType(ContentService.MimeType.JSON);

        } catch (accessError) {
            Logger.log("Erreur d'accès au Google Sheet: " + accessError.toString());
            throw new Error("Problème d'accès au Google Sheet. Vérifiez les autorisations: " + accessError.toString());
        }

    } catch (error) {
        Logger.log("Erreur globale: " + error.toString());

        // En cas d'erreur, répondre avec un message d'erreur
        return ContentService
            .createTextOutput(JSON.stringify({
                'result': 'error',
                'error': error.toString(),
                'logs': Logger.getLog()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Cette fonction est obligatoire pour activer CORS et peut être utilisée pour tester
function doGet(e) {
    var action = e.parameter.action;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (action === "getInscriptions") {
        // Récupérer toutes les inscriptions
        var data = getInscriptionsData();
        return ContentService.createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("Aucune action spécifiée")
        .setMimeType(ContentService.MimeType.TEXT);
}

function getInscriptionsData() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var result = [];

    // Ignorer la ligne d'en-tête
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var inscription = {};

        // Créer un objet avec les données de chaque ligne
        for (var j = 0; j < headers.length; j++) {
            inscription[headers[j]] = row[j];
        }

        result.push(inscription);
    }

    return result;
}

// Instructions de déploiement mises à jour:
// 1. Connectez-vous à votre compte Google
// 2. Ouvrez votre Google Sheet
// 3. Cliquez sur Extensions > Apps Script
// 4. Remplacez tout le code existant par ce code
// 5. Enregistrez le projet
// 6. Cliquez sur Déployer > Gérer les déploiements
// 7. Créez un nouveau déploiement ou mettez à jour le déploiement existant
// 8. Assurez-vous que l'accès est défini sur "Tout le monde"
// 9. Après déploiement, testez le script en accédant à l'URL avec "/exec" à la fin dans un navigateur
//    Cela appellera la fonction doGet() et vérifiera l'accès au fichier 