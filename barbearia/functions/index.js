// Cloud Function: avisa o dono no celular (push) quando um agendamento
// muda de status pra "cancelado". Só é acionada por escritas no Firestore,
// nunca chamada direto pelo site nem pelo painel.
'use strict';

const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();

const paraHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

exports.avisarCancelamento = onDocumentUpdated('agendamentos/{id}', async (event) => {
  const antes = event.data.before.data();
  const depois = event.data.after.data();

  // só dispara na transição PRA "cancelado" — evita repetir aviso em
  // updates futuros do mesmo documento já cancelado
  if (antes.status === 'cancelado' || depois.status !== 'cancelado') return;

  const tokensSnap = await db.collection('donoDispositivos').get();
  const tokens = tokensSnap.docs.map((d) => d.id);
  if (!tokens.length) return;

  const hora = typeof depois.horarioMin === 'number' ? paraHHMM(depois.horarioMin) : '';
  const resposta = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: 'Agendamento cancelado',
      body: `${depois.clienteNome || 'Um cliente'} cancelou ${depois.data || ''} às ${hora} (${depois.servicoNome || ''})`.trim(),
    },
  });

  // limpa tokens que não são mais válidos (app desinstalado, permissão
  // revogada etc.), pra não acumular lixo na coleção
  const invalidos = [];
  resposta.responses.forEach((r, i) => {
    const codigo = r.error && r.error.code;
    if (!r.success && (codigo === 'messaging/registration-token-not-registered' || codigo === 'messaging/invalid-registration-token')) {
      invalidos.push(tokens[i]);
    }
  });
  await Promise.all(invalidos.map((t) => db.collection('donoDispositivos').doc(t).delete()));
});
