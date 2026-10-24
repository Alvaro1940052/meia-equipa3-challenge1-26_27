:- encoding(utf8).
:- module(uncertainty_cf, [
    combine_cf/3,
    accumulate_cf/2,
    mycin_label/2,
    manager_exception_advice/1
]).

/** <module> Manager Exception Confidence Advisor (MYCIN Certainty Factors)
 *
 * Advisory layer for Levi's returns that require management review.
 * Reads facts already asserted by the deterministic engine and returns a
 * certainty factor in [-1.0, +1.0]. It never asserts decisao/1 and never
 * retracts working memory, so PERMITIR, RECUSAR, REVER and ENCAMINHAR stay
 * exactly as the 71 rules derived them.
 *
 * Combination formulas follow MYCIN (Shortliffe), as in the ENGCIA slides
 * on Factores de Certeza:
 *   - both >= 0: CF1 + CF2 * (1 - CF1)
 *   - both <  0: CF1 + CF2 * (1 + CF1)
 *   - opposite:  (CF1 + CF2) / (1 - min(|CF1|, |CF2|))
 * The opposite-sign formula is undefined when min(|CF1|, |CF2|) = 1
 * (perfect contradiction). That case returns 0.0.
 *
 * Evidence weights are heuristic degrees of belief attached to the criteria
 * named by EX-001 (sellability, proof, time, condition, request type).
 * They are not measurements and they are not additional normative rules.
 */

%!  combine_cf(+CF1, +CF2, -CF) is det.
%
%   MYCIN combination of two certainty factors.
combine_cf(CF1, CF2, CF) :-
    CF1 >= 0,
    CF2 >= 0,
    !,
    CF is CF1 + CF2 * (1 - CF1).
combine_cf(CF1, CF2, CF) :-
    CF1 < 0,
    CF2 < 0,
    !,
    CF is CF1 + CF2 * (1 + CF1).
combine_cf(CF1, CF2, CF) :-
    Abs1 is abs(CF1),
    Abs2 is abs(CF2),
    MinAbs is min(Abs1, Abs2),
    (   MinAbs >= 1.0
    ->  CF is 0.0
    ;   CF is (CF1 + CF2) / (1 - MinAbs)
    ).

%!  accumulate_cf(+CFList, -FinalCF) is det.
%
%   Left fold of combine_cf/3. The empty list is 0.0 (no evidence).
accumulate_cf([], 0.0) :- !.
accumulate_cf([CF], CF) :- !.
accumulate_cf([CF1, CF2|Rest], FinalCF) :-
    combine_cf(CF1, CF2, TempCF),
    accumulate_cf([TempCF|Rest], FinalCF).

%!  mycin_label(+CF, -Label) is det.
%
%   Linguistic scale for a certainty factor already rounded to two decimals.
mycin_label(CF, "Almost Certainly Approve (Quase Certamente Aprovar)") :-
    CF >= 0.8, !.
mycin_label(CF, "Probably Approve (Provavelmente Aprovar)") :-
    CF >= 0.4, !.
mycin_label(CF, "Unknown / Borderline Manager Call (Inconclusivo / Critério Estrito)") :-
    CF >= -0.2, !.
mycin_label(CF, "Probably Deny (Provavelmente Recusar)") :-
    CF >= -0.6, !.
mycin_label(_, "Almost Certainly Deny (Quase Certamente Recusar)").

%!  manager_exception_advice(-Advice) is det.
%
%   Builds the uncertainty_cf object from the current working memory.
%   context is "manager_review" when decisao(rever) is already derived,
%   and "auxiliary" otherwise. The deterministic decision is left untouched.
manager_exception_advice(Advice) :-
    findall(ev(Id, CF, Desc), cf_evidence(Id, CF, Desc), Fired),
    trace_factors(Fired, Trace, FinalCF),
    mycin_label(FinalCF, Label),
    advice_context(Context),
    Advice = _{
        final_cf: FinalCF,
        linguistic_label: Label,
        cf_factors_fired: Trace,
        cf_trace: Trace,
        context: Context,
        source: "EX-001"
    }.

% ------------------------------------------------------------------------------
% Evidence. Clause order is the combination order (positives, then negatives).
% Each clause is semidet: a scenario contributes each factor at most once.
% ------------------------------------------------------------------------------

cf_evidence("valid_proof", 0.50,
            "Valid proof of purchase is present. (Comprovativo de compra válido presente.)") :-
    valid_proof.

cf_evidence("sellable_in010", 0.60,
            "Item is sellable and verifiable, IN-010. (IN-010: Artigo vendável e verificável.)") :-
    once(has_fact(revendivel(true))).

cf_evidence("detached_tags_presented", 0.40,
            "Tags are detached but presented, not missing. (Etiquetas soltas mas apresentadas.)") :-
    once(has_fact(estado_produto(nao_usado_etiquetas_soltas))).

cf_evidence("exchange_or_store_credit", 0.45,
            "Customer asks for an exchange, a size swap, or store credit rather than cash. (Troca, troca de tamanho ou crédito de loja.)") :-
    exchange_or_store_credit.

cf_evidence("near_30_day_window", 0.25,
            "Return is just outside the 30-day window, 31-35 days. (Prazo entre 31 e 35 dias.)") :-
    days_in(31, 35).

cf_evidence("no_proof_blind_return", -0.50,
            "No proof of purchase / blind return. (Sem comprovativo, devolução às cegas.)") :-
    no_proof.

cf_evidence("not_sellable", -0.80,
            "Item is not sellable, IN-010. (IN-010: Artigo não vendável.)") :-
    once(has_fact(revendivel(false))).

cf_evidence("tags_missing", -0.40,
            "Tags are completely missing. (Etiquetas totalmente em falta.)") :-
    once(has_fact(estado_produto(nao_usado_sem_etiquetas))).

cf_evidence("clearly_worn", -0.65,
            "Item is clearly worn. (Artigo claramente usado.)") :-
    once(has_fact(estado_produto(claramente_usado))).

cf_evidence("beyond_60_days", -0.60,
            "More than 60 days have elapsed since purchase. (Mais de 60 dias desde a compra.)") :-
    days_above(60).

valid_proof :-
    has_fact(comprovativo(C)),
    valid_comprovativo(C),
    !.
valid_proof :-
    \+ has_fact(comprovativo(_)),
    has_fact(tem_comprovativo(true)),
    !.

valid_comprovativo(recibo_impresso).
valid_comprovativo(recibo_digital).
valid_comprovativo(recibo_original).
valid_comprovativo(confirmacao_encomenda).
valid_comprovativo(recibo_oferta).
valid_comprovativo(consulta_transacao).
valid_comprovativo(consulta_backpocket).

no_proof :-
    has_fact(comprovativo(nenhum)),
    !.
no_proof :-
    has_fact(tipo_verificacao(as_cegas)),
    \+ valid_proof,
    !.

exchange_or_store_credit :-
    (   has_fact(tipo_pedido(troca))
    ;   has_fact(troca_apenas_tamanho(true))
    ;   has_fact(meio_reembolso(credito_loja))
    ;   has_fact(meio_reembolso(vale_loja))
    ;   has_fact(meio_reembolso(cartao_oferta))
    ;   has_fact(tipo_transacao(troca))
    ;   has_fact(tipo_transacao(troca_ou_credito))
    ;   has_fact(tipo_transacao(troca_mesmo_artigo))
    ),
    !.

days_in(Low, High) :-
    has_fact(dias_desde_compra(D)),
    number(D),
    D >= Low,
    D =< High,
    !.

days_above(Limit) :-
    has_fact(dias_desde_compra(D)),
    number(D),
    D > Limit,
    !.

advice_context("manager_review") :-
    has_fact(decisao(rever)),
    !.
advice_context("auxiliary").

has_fact(Fact) :-
    retail_engine:facto(_, Fact).

% ------------------------------------------------------------------------------
% Trace. Each step records the evidence CF and the running MYCIN total.
% Running values are rounded to 2 decimals so the trace can be checked by hand.
% The fold uses those rounded values, and final_cf is the last running_cf.
% ------------------------------------------------------------------------------

trace_factors([], [], 0.0) :- !.
trace_factors([ev(Id, CF, Desc)|Rest], [First|Steps], FinalCF) :-
    cf_round(CF, Rounded),
    First = _{
        evidence: Id,
        cf: Rounded,
        running_cf: Rounded,
        combination: "initial",
        description: Desc
    },
    trace_rest(Rest, Rounded, Steps, FinalCF).

trace_rest([], FinalCF, [], FinalCF) :- !.
trace_rest([ev(Id, CF, Desc)|Rest], Prev, [Step|Steps], FinalCF) :-
    cf_round(CF, EvidenceCF),
    combine_cf(Prev, EvidenceCF, Raw),
    cf_round(Raw, Running),
    combination_kind(Prev, EvidenceCF, Kind),
    Step = _{
        evidence: Id,
        cf: EvidenceCF,
        running_cf: Running,
        combination: Kind,
        description: Desc
    },
    trace_rest(Rest, Running, Steps, FinalCF).

combination_kind(Prev, EvidenceCF, "positive") :-
    Prev >= 0,
    EvidenceCF >= 0,
    !.
combination_kind(Prev, EvidenceCF, "negative") :-
    Prev < 0,
    EvidenceCF < 0,
    !.
combination_kind(_, _, "conflict").

cf_round(X, Rounded) :-
    Rounded is round(X * 100) / 100.
