// Configuração do Firebase — usada pelo site público (barbearia/index.html),
// pelo painel do dono (barbearia/painel/index.html) e pelo service worker de
// notificações (barbearia/firebase-messaging-sw.js). Por isso usa "self" em
// vez de "window": dentro de um service worker não existe "window", e "self"
// funciona nos dois lugares.
//
// Como preencher:
// 1. Crie um projeto grátis em https://console.firebase.google.com (ou reuse
//    um projeto que você já tenha criado pra outro site, como a hamburgueria)
// 2. No projeto, ative o "Firestore Database" (modo produção) e o
//    "Authentication" → método de login "E-mail/senha"
// 3. Em ⚙ Configurações do projeto → Seus apps → </> (Web), registre um app
//    e copie os valores que aparecerem no lugar de 'COLE_AQUI' abaixo
// 4. Crie sua conta de dono em Authentication → Users → Add user, e rode o
//    script barbearia/scripts/definir-dono.js pra marcar ela como dono
// 5. Configure as regras do Firestore (veja o README na pasta barbearia/)
// 6. (Opcional, pra avisos push) Cloud Messaging → Web configuration →
//    Generate key pair → cole em FIREBASE_VAPID_KEY abaixo
//
// Enquanto os valores abaixo não forem trocados, o site continua funcionando
// normalmente (com os dados de exemplo do objeto BARBEARIA) e os agendamentos
// continuam indo pro WhatsApp — só não dá pra editar o catálogo pelo painel,
// criar conta de cliente, nem sincronizar a agenda entre aparelhos.
self.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDwjtNwGJ3O2OwQpq2pXnQ6TH7uyDDeU7I',
  authDomain: 'barba-nobre-56038.firebaseapp.com',
  projectId: 'barba-nobre-56038',
  storageBucket: 'barba-nobre-56038.firebasestorage.app',
  messagingSenderId: '932273788828',
  appId: '1:932273788828:web:a9af15a9b6ae891c7f9a59',
};

// Chave pública do Cloud Messaging, usada só pra ativar avisos push no
// painel (Catálogo → Avisos no celular). Sem isso, tudo o mais continua
// funcionando normalmente — só o botão de avisos fica indisponível.
self.FIREBASE_VAPID_KEY = 'COLE_AQUI';
