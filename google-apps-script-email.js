// Version améliorée du script Google Apps Script avec envoi d'email et débogage
// Remplacez tout le code existant par celui-ci

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
                        "WhatsApp",
                        "Créneau",
                        "Statut",
                        "Email envoyé",
                        "Logs"
                    ]);
                    Logger.log("Feuille 'Inscriptions' créée avec succès");
                } else {
                    Logger.log("Feuille 'Inscriptions' trouvée");

                    // Vérifier si la colonne Email envoyé existe
                    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
                    if (headers.indexOf("Email envoyé") === -1) {
                        // Ajouter la colonne si elle n'existe pas
                        sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Email envoyé");
                        Logger.log("Colonne 'Email envoyé' ajoutée");
                    }

                    if (headers.indexOf("Logs") === -1) {
                        // Ajouter la colonne logs si elle n'existe pas
                        sheet.getRange(1, sheet.getLastColumn() + 1).setValue("Logs");
                        Logger.log("Colonne 'Logs' ajoutée");
                    }
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
                data.whatsapp || '',
                data.creneau || '',
                'Inscrit', // Statut par défaut
                'Non' // Email envoyé - par défaut non
            ];

            Logger.log(rowData);

            // Ajouter les données à la feuille Google Sheet
            sheet.appendRow(rowData);
            const lastRow = sheet.getLastRow();
            Logger.log("Données ajoutées à la feuille avec succès dans la ligne " + lastRow);

            // Envoyer un email de confirmation si demandé
            let emailResult = "Non demandé";
            let emailLogs = "";

            Logger.log("Paramètre sendEmail: " + data.sendEmail);
            Logger.log("Email présent: " + (data.email ? "Oui" : "Non"));

            if (data.sendEmail === 'true' && data.email) {
                Logger.log("Tentative d'envoi d'email à " + data.email);
                try {
                    emailResult = envoyerEmailConfirmation(data);
                    emailLogs = "Tentative d'envoi: " + new Date().toLocaleString('fr-FR');

                    // Mettre à jour le statut d'envoi de l'email dans la dernière ligne
                    const emailColIndex = getColumnIndexByName(sheet, "Email envoyé");
                    const logsColIndex = getColumnIndexByName(sheet, "Logs");

                    if (emailColIndex > 0) {
                        sheet.getRange(lastRow, emailColIndex).setValue(emailResult.includes("succès") ? 'Oui' : 'Échec');
                    }

                    if (logsColIndex > 0) {
                        sheet.getRange(lastRow, logsColIndex).setValue(emailLogs + " - " + emailResult);
                    }

                    Logger.log("Statut de l'email mis à jour dans la feuille");
                } catch (emailError) {
                    emailResult = "Erreur: " + emailError.toString();
                    emailLogs = "Erreur d'envoi: " + emailError.toString();
                    Logger.log("Erreur lors de l'envoi de l'email: " + emailError.toString());

                    // Enregistrer l'erreur
                    const logsColIndex = getColumnIndexByName(sheet, "Logs");
                    if (logsColIndex > 0) {
                        sheet.getRange(lastRow, logsColIndex).setValue(emailLogs);
                    }
                }
            } else {
                emailLogs = "Email non demandé ou adresse manquante";
                Logger.log(emailLogs);

                // Enregistrer le log
                const logsColIndex = getColumnIndexByName(sheet, "Logs");
                if (logsColIndex > 0) {
                    sheet.getRange(lastRow, logsColIndex).setValue(emailLogs);
                }
            }

            // Répondre avec un succès
            return ContentService
                .createTextOutput(JSON.stringify({
                    'result': 'success',
                    'message': 'Inscription enregistrée avec succès',
                    'emailSent': emailResult,
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

/**
 * Trouve l'index d'une colonne par son nom
 * @param {Object} sheet - Feuille de calcul
 * @param {string} columnName - Nom de la colonne
 * @return {number} - Index de la colonne (1-based) ou 0 si non trouvé
 */
function getColumnIndexByName(sheet, columnName) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnIndex = headers.indexOf(columnName);
    return columnIndex >= 0 ? columnIndex + 1 : 0;
}

/**
 * Envoie un email de confirmation d'inscription
 * @param {Object} data - Les données d'inscription
 * @return {string} - Le résultat de l'envoi
 */
function envoyerEmailConfirmation(data) {
    try {
        const prenom = data.prenom || '';
        const nom = data.nom || '';
        const email = data.email || '';
        const creneau = data.creneau || '';
        const whatsapp = data.whatsapp || '+229 67 15 39 74'; // Utiliser le numéro fourni par l'utilisateur

        if (!email) {
            return "Adresse email manquante";
        }

        Logger.log("Préparation de l'email pour: " + email);

        // Vérifier les quotas d'emails
        const emailQuotaRemaining = MailApp.getRemainingDailyQuota();
        Logger.log("Quota d'emails restant: " + emailQuotaRemaining);

        if (emailQuotaRemaining <= 0) {
            return "Quota d'emails épuisé pour aujourd'hui";
        }

        // Sujet de l'email
        const sujet = "Confirmation d'inscription - Speak to Lead";

        // Corps de l'email en HTML
        const corps = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    background-color: #34C759;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    padding: 20px;
                    border: 1px solid #eee;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #777;
                }
                .button {
                    display: inline-block;
                    background-color: #34C759;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 4px;
                    margin-top: 15px;
                }
                .contact {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 20px;
                }
                h2 {
                    color: #34C759;
                }
                .details {
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 15px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Speak to Lead</h1>
                <p>Transformez vos idées en actions</p>
            </div>
            <div class="content">
                <h2>Bonjour ${prenom} ${nom},</h2>
                <p>Merci pour votre inscription au programme <strong>Speak to Lead</strong>. Votre participation est confirmée !</p>
                
                <div class="details">
                    <h3>Détails de votre inscription :</h3>
                    <p><strong>Date du créneau :</strong> Samedi ${creneau}</p>
                    <p><strong>Horaire :</strong> 18h-20h</p>
                    <p><strong>Adresse :</strong>  Bénin, Abomey-Calavi, Localisation Map: https://maps.app.goo.gl/TqCi5112j4ujsN83A?g_st=awb</p>
                </div>
                
                <h3>Ce que vous allez apprendre :</h3>
                <ul>
                    <li>Fluidité et confiance en anglais</li>
                    <li>Communication efficace et persuasion</li>
                    <li>Collaboration en environnement multilingue</li>
                </ul>
                
                <p>Nous vous recommandons d'arriver 10 minutes avant le début de la session.</p>
                
                <div class="contact">
                    <h3>Besoin d'aide ou de renseignements ?</h3>
                    <p>N'hésitez pas à nous contacter :</p>
                    <p>Téléphone : +229 01 67 15 39 74</p>
                    <p>WhatsApp : ${whatsapp}</p>
                </div>
                
                <p>Nous avons hâte de vous accueillir et de commencer cette aventure ensemble !</p>
                
                <p>Cordialement,<br>
                L'équipe Speak to Lead</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Speak to Lead. Tous droits réservés.</p>
            </div>
        </body>
        </html>
        `;

        Logger.log("Préparation de l'envoi...");

        // Tester d'abord avec MailApp
        try {
            MailApp.sendEmail({
                to: email,
                subject: sujet,
                htmlBody: corps,
                name: "Speak to Lead"
            });

            Logger.log("Email envoyé avec MailApp à " + email);
            return "Email envoyé avec succès (MailApp)";
        } catch (mailAppError) {
            Logger.log("Erreur avec MailApp: " + mailAppError.toString() + ". Tentative avec GmailApp...");

            // Si MailApp échoue, essayer avec GmailApp
            try {
                GmailApp.sendEmail(
                    email,
                    sujet,
                    "Votre inscription au programme Speak to Lead a été confirmée pour le samedi " + creneau + " (18h-20h).", // Version texte simple
                    {
                        htmlBody: corps,
                        name: "Speak to Lead"
                    }
                );

                Logger.log("Email envoyé avec GmailApp à " + email);
                return "Email envoyé avec succès (GmailApp)";
            } catch (gmailError) {
                Logger.log("Erreur avec GmailApp: " + gmailError.toString());
                throw new Error("Échec de l'envoi par MailApp et GmailApp: " + gmailError.toString());
            }
        }

    } catch (error) {
        Logger.log("Erreur lors de l'envoi de l'email: " + error.toString());
        return "Erreur: " + error.toString();
    }
}

// Cette fonction est obligatoire pour activer CORS et peut être utilisée pour tester
function doGet(e) {
    var action = e.parameter.action;

    if (!action) {
        return ContentService
            .createTextOutput(JSON.stringify({
                'result': 'success',
                'message': 'API opérationnelle. Utilisez le paramètre action pour spécifier une action.',
                'quotaEmailRestant': MailApp.getRemainingDailyQuota()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (action === "getInscriptions") {
        // Récupérer toutes les inscriptions
        var data = getInscriptionsData();
        return ContentService.createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
    } else if (action === "testEmail") {
        // Tester l'envoi d'email
        var email = e.parameter.email;
        if (!email) {
            return ContentService.createTextOutput(JSON.stringify({
                'result': 'error',
                'message': 'Email manquant'
            }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        var testData = {
            prenom: "Test",
            nom: "Utilisateur",
            email: email,
            creneau: "01/01/2024"
        };

        var result = envoyerEmailConfirmation(testData);

        return ContentService.createTextOutput(JSON.stringify({
            'result': 'success',
            'message': 'Test d\'email',
            'emailResult': result,
            'logs': Logger.getLog()
        }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
        'result': 'error',
        'message': 'Action non reconnue'
    }))
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
// 5. Enregistrez le projet sous le nom "Speak to Lead Inscription"
// 6. IMPORTANT: Avant de déployer, cliquez sur Exécuter > doGet pour autoriser l'accès à l'envoi d'emails et aux feuilles de calcul
// 7. Cliquez sur Déployer > Nouvelle déploiement
// 8. Type de déploiement: Application Web
// 9. Assurez-vous que l'accès est défini sur:
//    - Exécuter en tant que: Moi (votre compte)
//    - Qui peut accéder: Tout le monde
// 10. Après déploiement, testez l'envoi d'email en accédant à:
//     [URL du déploiement]/exec?action=testEmail&email=votre-email@example.com

