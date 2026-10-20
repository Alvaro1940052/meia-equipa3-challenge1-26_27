:- module(test_retail_hard_stops, []).

/** <module> PLUnit Tests: Hard-Stop Precedence and Inference Termination (RPAC 4.6)
 *
 * Validates that:
 * 1. A terminal hard stop (HS-006, CH-008, CH-007, HS-001..HS-004) ends the
 *    inference: no further condition, proof, channel or tender rule fires.
 * 2. Hard stops prevail by precedence, independently of the order in which the
 *    triggering facts were inserted.
 * 3. Transversal safety/customer rules (PC-008, BW-004, EX-002, EX-003, EX-008)
 *    still fire after a stop, without overriding the stop's decision.
 * 4. HS-005 is not terminal.
 * 5. No further questions are asked in interactive mode once a stop fired.
 * 6. Why Not explains outcomes blocked by a stop.
 */

:- use_module(library(plunit)).
:- use_module('../src/core/retail_engine/engine').
:- use_module('../src/core/retail_engine/interactive').

regras_disparadas(Ids) :-
    findall(Id, retail_engine:facto(_, regra_disparada(Id)), Ids).

decisoes(Ds) :-
    findall(D, retail_engine:facto(_, decisao(D)), Ds).

has_fact(Fact) :-
    retail_engine:facto(_, Fact).

carregar_kb :-
    retail_engine:load_knowledge_base(retail_rules).

% Customised item that would otherwise also trigger CH-001, PT-001, PC-004/PC-006 and TN-001.
cenario_hs003([
    colaborador_autorizado(true), mercado(eua), tipo_loja(mainline), canal_compra(mainline),
    comprovativo(recibo_impresso), tipo_pedido(devolucao), dias_desde_compra(10),
    sku_reconhecido(true), marca(levis), personalizado_ou_alterado(true),
    categoria_produto(vestuario), estado_produto(claramente_usado), defeito_fabrico(true),
    meio_pagamento(credito), conta_cartao_ativa(true), cliente_contesta(false)
]).

:- begin_tests(retail_hard_stops_suite, [setup(carregar_kb)]).

% ------------------------------------------------------------------------------
% 1. Termination
% ------------------------------------------------------------------------------

test(hs_003_terminates_inference) :-
    cenario_hs003(Factos),
    retail_engine:evaluate_facts(Factos, R),
    assertion(R.decision == recusar),
    assertion(R.hard_stop == 'HS-003'),
    regras_disparadas(Ids),
    assertion(Ids == ['HS-003']),
    decisoes(Ds),
    assertion(Ds == [recusar]),
    assertion(\+ has_fact(tipo_verificacao(_))),
    assertion(\+ has_fact(tipo_reembolso(_))).

% ------------------------------------------------------------------------------
% 2. Precedence (independent of fact insertion order)
% ------------------------------------------------------------------------------

test(hs_006_prevails_when_inserted_last) :-
    retail_engine:evaluate_facts([
        canal_compra(mainline), tipo_loja(mainline), comprovativo(recibo_impresso),
        sku_reconhecido(true), categoria_produto(vestuario), estado_produto(nao_usado_com_etiquetas),
        colaborador_autorizado(false)
    ], R),
    assertion(R.decision == encaminhar),
    regras_disparadas(Ids),
    assertion(Ids == ['HS-006']).

test(hs_006_over_ch_008) :-
    retail_engine:evaluate_facts([canal_compra(grossista), colaborador_autorizado(false)], R),
    assertion(R.decision == encaminhar),
    regras_disparadas(Ids),
    assertion(Ids == ['HS-006']).

test(ch_008_over_hs_003) :-
    retail_engine:evaluate_facts([
        colaborador_autorizado(true), personalizado_ou_alterado(true), canal_compra(grossista)
    ], R),
    assertion(R.decision == recusar),
    regras_disparadas(Ids),
    assertion(Ids == ['CH-008']).

test(hs_001_over_hs_003) :-
    retail_engine:evaluate_facts([
        colaborador_autorizado(true), canal_compra(mainline),
        personalizado_ou_alterado(true), sku_reconhecido(false)
    ], R),
    assertion(R.decision == recusar),
    regras_disparadas(Ids),
    assertion(Ids == ['HS-001']).

% ------------------------------------------------------------------------------
% 3. Transversal rules still fire
% ------------------------------------------------------------------------------

test(transversal_rules_fire_after_stop) :-
    retail_engine:evaluate_facts([
        colaborador_autorizado(true), canal_compra(mainline), personalizado_ou_alterado(true),
        categoria_produto(vestuario), estado_produto(sujo_contaminado_inseguro),
        cliente_agitado(true), risco_fraude(alto)
    ], R),
    regras_disparadas(Ids),
    assertion(memberchk('HS-003', Ids)),
    assertion(memberchk('PC-008', Ids)),
    assertion(memberchk('EX-003', Ids)),
    assertion(memberchk('EX-008', Ids)),
    assertion(\+ memberchk('EX-001', Ids)),
    assertion(has_fact(destino_produto(isolamento_risco_biologico))),
    % The stop's decision prevails over the escalation raised by EX-008.
    assertion(R.decision == recusar).

% ------------------------------------------------------------------------------
% 4. HS-005 is not terminal
% ------------------------------------------------------------------------------

test(hs_005_is_not_terminal) :-
    retail_engine:evaluate_facts([
        colaborador_autorizado(true), meio_pagamento(afterpay), afterpay_pede_excecao(true)
    ], R),
    assertion(R.hard_stop == null),
    assertion(has_fact(regra_disparada('HS-005'))),
    assertion(\+ retail_engine:paragem_ativa(_)).

% ------------------------------------------------------------------------------
% 5. Interactive mode: no questions after the stop
% ------------------------------------------------------------------------------

test(interactive_asks_nothing_after_stop) :-
    retail_interactive:set_mock_answers([
        dias_desde_compra(_) - 10,
        meio_pagamento(_) - credito,
        sessao_pos_propria(_) - true
    ]),
    retail_engine:run_interactive([
        colaborador_autorizado(true), canal_compra(mainline), sku_reconhecido(true),
        personalizado_ou_alterado(true), categoria_produto(vestuario),
        estado_produto(claramente_usado), comprovativo(recibo_impresso)
    ], R),
    assertion(R.decision == recusar),
    findall(T, member(asked(T, _), R.dialogue_log), Perguntas),
    assertion(Perguntas == []).

% ------------------------------------------------------------------------------
% 6. Why Not after a stop
% ------------------------------------------------------------------------------

test(whynot_reports_blocking_stop) :-
    cenario_hs003(Factos),
    retail_engine:evaluate_facts(Factos, _),
    retail_engine:explain_whynot(permitir, Linhas),
    assertion(once((member(L, Linhas), sub_string(L, _, _, _, "hard stop HS-003")))).

:- end_tests(retail_hard_stops_suite).
