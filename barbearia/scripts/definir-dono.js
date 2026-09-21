// Marca uma conta do Firebase Authentication como "dono" da barbearia.
// É essa marcação (um "custom claim") que as regras do Firestore usam pra
// saber quem pode ver a agenda inteira, editar o catálogo e apagar
// agendamentos — sem ela, mesmo logado, a conta só teria os poderes de um
// cliente comum.
//
// Como rodar (uma vez só, depois de criar a conta do dono no Firebase):
//   1. cd barbearia/scripts
//   2. npm install firebase-admin --no-save
//   3. gcloud auth application-default login   (autoriza este script a
//      agir no seu projeto, sem precisar baixar nenhuma chave)
//   4. node definir-dono.js seu@email.com barba-nobre-56038
//
// Depois de rodar, saia e entre de novo no painel (aba Catálogo) pra essa
// permissão valer — o navegador só busca a marcação nova ao logar de novo.
'use strict';

const admin = require('firebase-admin');

const email = process.argv[2];
const projectId = process.argv[3];

if (!email || !projectId) {
  console.error('Uso: node definir-dono.js seu@email.com SEU_PROJECT_ID');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId });

admin.auth().getUserByEmail(email)
  .then((user) => admin.auth().setCustomUserClaims(user.uid, { owner: true }).then(() => user))
  .then((user) => {
    console.log(`Pronto! ${email} (uid ${user.uid}) agora é dono no projeto ${projectId}.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error('Erro:', e.message);
    process.exit(1);
  });
