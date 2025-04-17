# Guide de dépannage pour le formulaire d'inscription Speak to Lead

Ce guide vous aidera à résoudre les problèmes courants rencontrés avec le formulaire d'inscription connecté à Google Sheets.

## Problème : Les données ne s'enregistrent pas dans Google Sheets

Si votre formulaire affiche un message de succès mais que les données n'apparaissent pas dans Google Sheets, voici les étapes de dépannage à suivre :

### 1. Vérifier le nom de la feuille dans Google Sheets

- Ouvrez votre Google Sheet
- Assurez-vous qu'il y a un onglet nommé exactement **"Inscriptions"** (sensible à la casse)
- Si ce n'est pas le cas, renommez un onglet existant ou créez-en un nouveau avec ce nom exact

### 2. Vérifier l'ID du Google Sheet

- Vérifiez que l'ID dans le script Google Apps Script correspond bien à votre Google Sheet
- L'ID se trouve dans l'URL : `https://docs.google.com/spreadsheets/d/[VOTRE_ID_ICI]/edit`
- Vérifiez que l'ID `1uq8bGoFpuWSoMJQTgjCAFtWbcBgUahSwWWD3BIzA4_4` est correct

### 3. Tester la connexion avec Google Apps Script

- Utilisez le bouton "Test technique" dans le formulaire
- Consultez la console du navigateur (F12) pour voir les détails de la réponse
- Si vous voyez une erreur CORS, assurez-vous que votre script est déployé avec les bonnes autorisations

### 4. Vérifier les autorisations du Google Sheet

- Assurez-vous que le compte Google qui a déployé le script a accès en écriture au Google Sheet
- Essayez de rendre le Google Sheet accessible à "Toute personne disposant du lien" avec des droits d'édition

### 5. Redéployer le script Google Apps Script

1. Ouvrez votre Google Sheet
2. Allez dans Extensions > Apps Script
3. Remplacez le code par celui du fichier `google-apps-script-debug.js`
4. Enregistrez les modifications
5. Allez dans Déployer > Gérer les déploiements
6. Créez un nouveau déploiement :
   - Type : Application web
   - Exécuter en tant que : Vous-même
   - Qui peut accéder : Tout le monde, même anonymement
7. Copiez la nouvelle URL et mettez à jour la variable `scriptURL` dans `index.html`

### 6. Tester manuellement le script

Vous pouvez tester directement le script en accédant à l'URL du script dans un navigateur. Cela va exécuter la fonction `doGet()` qui vérifiera l'accès au Google Sheet.

### 7. Vérifiez les journaux d'exécution dans Google Apps Script

1. Ouvrez l'éditeur Google Apps Script
2. Exécutez manuellement la fonction doGet
3. Cliquez sur "Exécution" > "Exécutions actuelles" pour voir les journaux et détecter d'éventuelles erreurs

## Autres problèmes courants

### Problème : Erreurs CORS

Si vous voyez des erreurs CORS dans la console, c'est généralement parce que :
- Votre script n'est pas correctement déployé comme application web
- Vous n'avez pas défini "Tout le monde, même anonymement" pour les accès
- Vous utilisez une ancienne version du script

### Problème : Message "Exécution dépassée"

Si Google Apps Script renvoie un message "Exécution dépassée", c'est généralement parce que :
- Votre Google Sheet contient trop de données
- Votre script contient des boucles inefficaces

### Problème : Les données arrivent dans un format incorrect

Si les données s'enregistrent mais dans un format incorrect :
- Vérifiez l'ordre des colonnes dans le script Google Apps Script
- Assurez-vous que les noms des champs du formulaire correspondent à ceux attendus par le script

## Solution recommandée

Si après avoir suivi toutes ces étapes vous rencontrez encore des problèmes, essayez cette solution simplifiée :

1. Créez un nouveau formulaire Google Forms directement à partir de Google Sheet
2. Intégrez ce formulaire Google Forms sur votre site
3. Les réponses seront automatiquement enregistrées dans Google Sheets sans code supplémentaire

## Besoin d'aide supplémentaire ?

Si vous avez besoin d'aide supplémentaire, n'hésitez pas à consulter la documentation officielle :
- [Documentation Google Apps Script](https://developers.google.com/apps-script)
- [Documentation Google Sheets API](https://developers.google.com/sheets/api) 