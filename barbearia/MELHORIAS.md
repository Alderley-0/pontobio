# Ideias e melhorias futuras — Barba Nobre

Lista viva de possíveis melhorias pro site/painel. **Nada aqui foi
implementado** — é só anotação pra não esquecer as ideias. Quando quiser
tocar algum item, é só pedir que a gente planeja e implementa.

---

## Suas ideias

### 1. Limite de cancelamento

Hoje o cliente pode cancelar um agendamento a qualquer momento, até em cima
da hora — o que deixa o barbeiro sem tempo de preencher aquele horário com
outro cliente. A ideia é criar uma regra de limite, por exemplo:

- **Antecedência mínima pra cancelar** (ex.: só pode cancelar com 2h ou mais
  de antecedência; depois disso, o botão de cancelar some ou avisa "ligue
  direto pro barbeiro").
- *Alternativa/complemento:* **limite de quantos cancelamentos** um cliente
  pode fazer por mês antes de precisar confirmar por WhatsApp em vez de
  cancelar sozinho pelo site (evita cliente que marca e desmarca toda hora).

Pontos a decidir quando for implementar: qual a antecedência mínima, se é a
mesma regra pra quem tem conta e pra quem agenda sem conta (hoje só quem tem
conta cancela direto pelo site — ver `barbearia/index.html`), e se o dono
deve poder ajustar esse número pelo painel (Catálogo) ou só no código.

### 2. Modo cronômetro (início/fim do corte, estilo Uber) — ✅ implementado (versão de teste)

A referência é exatamente a corrida do Uber: o motorista aperta "iniciar
corrida" e "encerrar corrida", e o sistema reage ao tempo real gasto. No
painel, o barbeiro aperta **"Iniciar corte"** no agendamento que está
atendendo e **"Finalizar corte"** quando termina (botões na ficha do
agendamento, em `barbearia/painel/index.html`).

Como ficou, depois de decidido com o dono:
1. Ao finalizar, o sistema compara a duração real (do "iniciar" ao
   "finalizar") com a duração prevista do serviço — pra mais cedo ou pra
   mais tarde (atraso), os dois casos tratados igual.
2. **Não desloca sozinho.** Se há agendamentos seguintes do mesmo barbeiro
   no mesmo dia, abre uma tela mostrando o horário atual → novo horário de
   cada um, com caixinha pra desmarcar quem não deve mudar. Só altera a
   agenda depois do dono confirmar.
3. Depois de confirmar, abre uma lista com um botão de WhatsApp pronto por
   cliente afetado (mensagem configurável em Mais → Mensagens do WhatsApp),
   pra avisar manualmente — não é envio automático/push.

Fica como dado histórico nos próprios campos do agendamento
(`horaInicioReal`/`horaFimReal`), mas ainda não tem uma tela comparando
duração real × cadastrada por serviço — pode ser uma próxima melhoria.

---

## Outras ideias (sugestões minhas — fique à vontade pra ignorar)

- **Lembrete automático por WhatsApp** algumas horas antes do horário
  (hoje o único contato é no momento do agendamento/cancelamento).
- **Marcar "não compareceu"** direto da agenda quando o cliente falta sem
  avisar (o painel já tem os status `confirmado/concluido/cancelado`, falta
  um `faltou` com contagem por cliente).
- **Histórico e fidelidade do cliente**: quantos cortes já fez, qual o
  serviço favorito, selo de "cliente frequente" — aparece quando o dono
  abre o agendamento dele.
- **Avaliação rápida pós-corte**: depois do horário passar, pedir uma nota
  de 1 a 5 pro cliente (pelo link do WhatsApp mesmo, sem precisar de app).
- **Relatório simples de faturamento** por período/barbeiro dentro do
  painel, somando os `preco` dos agendamentos concluídos.
- **Fila de espera**: se um horário está lotado, cliente entra numa lista e
  é avisado se vagar (por causa de cancelamento).

---

*Arquivo de referência, não precisa mexer nele manualmente — é só pra guardar
ideia. Quando quiser implementar algo daqui, me chama apontando o item.*
