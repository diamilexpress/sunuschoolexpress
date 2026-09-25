/**
 * Point d'entrée serveur pour Render et hébergeurs Cloud
 * Démarre le serveur Express sur le port assigné par Render
 */
const app = require('./backend/server.js');
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`🚀 SunuSchoolExpress API démarrée sur le port ${PORT}`);
  console.log(`📡 Écoute sur 0.0.0.0:${PORT} prête pour Render`);
  console.log(`======================================================`);
});
