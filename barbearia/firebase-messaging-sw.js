// Service worker do Firebase Cloud Messaging — recebe os avisos push mesmo
// com o painel fechado ou o navegador minimizado. Só entra em ação depois
// que o dono clica em "Ativar avisos neste aparelho" na aba Catálogo do
// painel; sem isso, esse arquivo nunca é registrado e não faz nada.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
importScripts('firebase-config.js');

if (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey && self.FIREBASE_CONFIG.apiKey !== 'COLE_AQUI') {
  firebase.initializeApp(self.FIREBASE_CONFIG);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || 'Aviso da barbearia', {
      body: body || '',
      tag: 'barbearia-aviso',
    });
  });
}
