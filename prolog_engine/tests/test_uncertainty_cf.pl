:- encoding(utf8).
:- module(test_uncertainty_cf, []).

/** <module> PLUnit tests for the MYCIN certainty-factor advisor.
 *
 * The advisor is read-only: these tests check the combination formulas and
 * that a PC-002 review still ends as decisao(rever).
 */

:- use_module(library(plunit)).
:- use_module('../src/core/retail_engine/engine', [
    load_knowledge_base/1,
    evaluate_facts/2,
    reset_session/0,
    facto/2
]).
:- use_module('../src/core/retail_engine/uncertainty_cf', [
    combine_cf/3,
    accumulate_cf/2,
    mycin_label/2,
    manager_exception_advice/1
]).

:- begin_tests(uncertainty_cf, [
    setup(reset_session),
    cleanup(reset_session)
]).

test(combine_both_positive) :-
    combine_cf(0.5, 0.6, CF),
    assertion(abs(CF - 0.8) < 0.000001).

test(combine_both_negative) :-
    combine_cf(-0.5, -0.8, CF),
    assertion(abs(CF - -0.9) < 0.000001).

test(combine_opposite_signs) :-
    combine_cf(0.5, -0.8, CF),
    assertion(abs(CF - -0.6) < 0.000001).

test(combine_perfect_contradiction_is_zero) :-
    combine_cf(1.0, -1.0, CF),
    assertion(CF =:= 0.0).

test(accumulate_empty_and_chain) :-
    accumulate_cf([], Empty),
    assertion(Empty =:= 0.0),
    accumulate_cf([0.5, 0.4, 0.45], CF),
    % 0.50 -> 0.70 -> 0.835
    assertion(abs(CF - 0.835) < 0.000001).

test(mycin_scale_boundaries) :-
    mycin_label(0.8, Almost),
    mycin_label(0.4, ProbablyYes),
    mycin_label(0.39, Unknown),
    mycin_label(-0.2, UnknownLow),
    mycin_label(-0.21, ProbablyNo),
    mycin_label(-0.6, ProbablyNoLow),
    mycin_label(-0.61, AlmostNo),
    assertion(sub_string(Almost, _, _, _, "Almost Certainly Approve")),
    assertion(sub_string(ProbablyYes, _, _, _, "Probably Approve")),
    assertion(sub_string(Unknown, _, _, _, "Unknown")),
    assertion(sub_string(UnknownLow, _, _, _, "Unknown")),
    assertion(sub_string(ProbablyNo, _, _, _, "Probably Deny")),
    assertion(sub_string(ProbablyNoLow, _, _, _, "Probably Deny")),
    assertion(sub_string(AlmostNo, _, _, _, "Almost Certainly Deny")).

test(advice_matches_trace_and_does_not_invent_a_decision) :-
    assertz(retail_engine:facto(1, comprovativo(recibo_digital))),
    assertz(retail_engine:facto(2, estado_produto(nao_usado_etiquetas_soltas))),
    assertz(retail_engine:facto(3, tipo_pedido(troca))),
    assertz(retail_engine:facto(4, decisao(rever))),
    manager_exception_advice(Advice),
    assertion(Advice.context == "manager_review"),
    assertion(Advice.source == "EX-001"),
    assertion(Advice.final_cf >= 0.8),
    assertion(Advice.final_cf < 0.9),
    assertion(Advice.cf_trace == Advice.cf_factors_fired),
    last(Advice.cf_trace, Last),
    assertion(Last.running_cf =:= Advice.final_cf),
    assertion(sub_string(Advice.linguistic_label, _, _, _, "Almost Certainly Approve")),
    % The advisor must not have written a second decision fact.
    findall(D, retail_engine:facto(_, decisao(D)), Decisions),
    assertion(Decisions == [rever]).

test(pc002_review_decision_stays_rever, [setup(load_knowledge_base(retail_rules))]) :-
    evaluate_facts([
        colaborador_autorizado(true),
        sku_reconhecido(true),
        estado_produto(nao_usado_etiquetas_soltas),
        comprovativo(recibo_digital),
        tipo_pedido(troca),
        troca_apenas_tamanho(true),
        dias_desde_compra(29),
        categoria_produto(vestuario)
    ], Result),
    assertion(Result.decision == rever),
    manager_exception_advice(Advice),
    assertion(Advice.context == "manager_review"),
    assertion(Advice.final_cf >= 0.8),
    \+ get_dict(uncertainty_cf, Result, _).

:- end_tests(uncertainty_cf).
