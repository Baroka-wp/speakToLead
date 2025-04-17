const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Couleurs de notre thème
const bgColor = '#34C759'; // Vert accent
const textColor = '#FFFFFF'; // Blanc

// Fonction pour créer un favicon carré avec les initiales SL
function createFavicon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fond vert
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Texte "SL" centré
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Ajuster la taille de la police en fonction de la taille du canvas
    const fontSize = Math.floor(size * 0.5);
    ctx.font = `bold ${fontSize}px "SF Pro Display", sans-serif`;

    // Dessiner le texte au centre
    ctx.fillText('SL', size / 2, size / 2 + fontSize * 0.1);

    return canvas;
}

// Générer les favicons de différentes tailles
const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180
};

// Créer le répertoire si nécessaire
Object.entries(sizes).forEach(([filename, size]) => {
    const canvas = createFavicon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, filename), buffer);
    console.log(`${filename} created successfully`);
});

// Générer le fichier ICO (favicon.ico)
// Nous utilisons simplement le PNG 32x32 comme favicon.ico pour simplifier
fs.copyFileSync(
    path.join(__dirname, 'favicon-32x32.png'),
    path.join(__dirname, 'favicon.ico')
);
console.log('favicon.ico created successfully');

// Créer le fichier site.webmanifest
const manifest = {
    name: 'Speak to Lead',
    short_name: 'SpeakLead',
    icons: [
        {
            src: '/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png'
        },
        {
            src: '/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
        },
        {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
        }
    ],
    theme_color: '#34C759',
    background_color: '#FFFFFF',
    display: 'standalone'
};

fs.writeFileSync(
    path.join(__dirname, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
);
console.log('site.webmanifest created successfully');

console.log('All favicon files have been generated!'); 