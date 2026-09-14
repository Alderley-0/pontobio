// Configuração do Firebase — usada pelo cardápio (hamburgueria/index.html)
// e pelo painel do dono (hamburgueria/painel/index.html).
//
// Como preencher:
// 1. Crie um projeto grátis em https://console.firebase.google.com
// 2. No projeto, ative o "Firestore Database" (modo produção) e o
//    "Authentication" → método de login "E-mail/senha"
// 3. Em ⚙ Configurações do projeto → Seus apps → </> (Web), registre um app
//    e copie os valores que aparecerem no lugar de 'COLE_AQUI' abaixo
// 4. Crie o usuário do dono em Authentication → Users → Add user
// 5. Configure as regras do Firestore (veja o README na pasta hamburgueria/)
//
// Enquanto os valores abaixo não forem trocados, o cardápio continua
// funcionando normalmente (com os dados de exemplo) e os pedidos continuam
// indo pro WhatsApp — só não fica salvo histórico nem dá pra usar o painel.
window.FIREBASE_CONFIG = {
  apiKey: 'COLE_AQUI',
  authDomain: 'COLE_AQUI.firebaseapp.com',
  projectId: 'COLE_AQUI',
  storageBucket: 'COLE_AQUI.appspot.com',
  messagingSenderId: 'COLE_AQUI',
  appId: 'COLE_AQUI',
};
