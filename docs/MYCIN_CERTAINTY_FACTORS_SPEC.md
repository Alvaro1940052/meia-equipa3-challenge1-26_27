# MYCIN Certainty Factors — EX-001 Exception Advisor

Read-only advisor for Levi's return reviews. It scores evidence already derived by the deterministic engine and never changes `PERMITIR`, `RECUSAR`, `REVER`, or `ENCAMINHAR`. The Prolog implementation is `prolog_engine/src/core/retail_engine/uncertainty_cf.pl`. A Drools port must reproduce these weights, this combination order, this rounding, and this JSON shape.

The advisor reads the working memory **after** the deterministic rules have run, including derived facts such as `meio_reembolso(credito_loja)` from PT-004. Each factor fires at most once. Clause order below is the combination order: positives first, then negatives.

## Combination

Let `CF1` be the running total and `CF2` the next evidence factor.

| Case | Formula |
| --- | --- |
| Both `>= 0` | `CF1 + CF2 * (1 - CF1)` |
| Both `< 0` | `CF1 + CF2 * (1 + CF1)` |
| Opposite signs | `(CF1 + CF2) / (1 - min(abs(CF1), abs(CF2)))` |

If the opposite-sign case has `min(abs(CF1), abs(CF2)) >= 1` (perfect contradiction), the result is `0.0`.

No evidence yields `final_cf = 0.0` and the Unknown label.

## Rounding

Round every evidence CF and every running total to 2 decimal places **before** the next combination. The next fold uses that rounded value, and `final_cf` is the last running total.

```
rounded = round(x * 100) / 100
```

`round/1` in SWI-Prolog is half away from zero. Example: `0.835` becomes `0.84`.

## Linguistic label

Apply the scale to the already rounded `final_cf`. Labels are bilingual, English then Portuguese in parentheses.

| Range | Label |
| --- | --- |
| `>= 0.8` | `Almost Certainly Approve (Quase Certamente Aprovar)` |
| `>= 0.4` | `Probably Approve (Provavelmente Aprovar)` |
| `>= -0.2` | `Unknown / Borderline Manager Call (Inconclusivo / Critério Estrito)` |
| `>= -0.6` | `Probably Deny (Provavelmente Recusar)` |
| otherwise | `Almost Certainly Deny (Quase Certamente Recusar)` |

## Evidence

Descriptions follow `English sentence. (Portuguese sentence.)`. Do not put an extra pair of parentheses in the English sentence. The dashboard splits on the first `(`.

| `evidence` | CF | Fires when |
| --- | --- | --- |
| `valid_proof` | `+0.50` | `comprovativo/1` is one of `recibo_impresso`, `recibo_digital`, `recibo_original`, `confirmacao_encomenda`, `recibo_oferta`, `consulta_transacao`, `consulta_backpocket`. If there is no `comprovativo/1` fact, `tem_comprovativo(true)` also counts. `foto_recibo` does **not** count. |
| `sellable_in010` | `+0.60` | `revendivel(true)` |
| `detached_tags_presented` | `+0.40` | `estado_produto(nao_usado_etiquetas_soltas)` |
| `exchange_or_store_credit` | `+0.45` | Any one of `tipo_pedido(troca)`, `troca_apenas_tamanho(true)`, `meio_reembolso(credito_loja)`, `meio_reembolso(vale_loja)`, `meio_reembolso(cartao_oferta)`, `tipo_transacao(troca)`, `tipo_transacao(troca_ou_credito)`, `tipo_transacao(troca_mesmo_artigo)`. Still one factor. |
| `near_30_day_window` | `+0.25` | `dias_desde_compra(D)` with `31 <= D <= 35` |
| `no_proof_blind_return` | `-0.50` | `comprovativo(nenhum)`, or `tipo_verificacao(as_cegas)` when valid proof did not fire |
| `not_sellable` | `-0.80` | `revendivel(false)` |
| `tags_missing` | `-0.40` | `estado_produto(nao_usado_sem_etiquetas)` |
| `clearly_worn` | `-0.65` | `estado_produto(claramente_usado)` |
| `beyond_60_days` | `-0.60` | `dias_desde_compra(D)` with `D > 60` |

Trace descriptions:

- `valid_proof`: `Valid proof of purchase is present. (Comprovativo de compra válido presente.)`
- `sellable_in010`: `Item is sellable and verifiable, IN-010. (IN-010: Artigo vendável e verificável.)`
- `detached_tags_presented`: `Tags are detached but presented, not missing. (Etiquetas soltas mas apresentadas.)`
- `exchange_or_store_credit`: `Customer asks for an exchange, a size swap, or store credit rather than cash. (Troca, troca de tamanho ou crédito de loja.)`
- `near_30_day_window`: `Return is just outside the 30-day window, 31-35 days. (Prazo entre 31 e 35 dias.)`
- `no_proof_blind_return`: `No proof of purchase / blind return. (Sem comprovativo, devolução às cegas.)`
- `not_sellable`: `Item is not sellable, IN-010. (IN-010: Artigo não vendável.)`
- `tags_missing`: `Tags are completely missing. (Etiquetas totalmente em falta.)`
- `clearly_worn`: `Item is clearly worn. (Artigo claramente usado.)`
- `beyond_60_days`: `More than 60 days have elapsed since purchase. (Mais de 60 dias desde a compra.)`

`context` is `manager_review` when `decisao(rever)` is already derived, otherwise `auxiliary`. `source` is always `EX-001`.

## JSON

`POST /retail/evaluate` adds `uncertainty_cf` beside the existing decision fields. On an advisor failure the route still returns the deterministic verdict, with `final_cf` `0.0`, empty traces, `context` `auxiliary`, and the Unknown label.

```json
{
  "uncertainty_cf": {
    "final_cf": 0.84,
    "linguistic_label": "Almost Certainly Approve (Quase Certamente Aprovar)",
    "cf_factors_fired": [],
    "cf_trace": [
      {
        "evidence": "valid_proof",
        "cf": 0.50,
        "running_cf": 0.50,
        "combination": "initial",
        "description": "Valid proof of purchase is present. (Comprovativo de compra válido presente.)"
      },
      {
        "evidence": "detached_tags_presented",
        "cf": 0.40,
        "running_cf": 0.70,
        "combination": "positive",
        "description": "Tags are detached but presented, not missing. (Etiquetas soltas mas apresentadas.)"
      },
      {
        "evidence": "exchange_or_store_credit",
        "cf": 0.45,
        "running_cf": 0.84,
        "combination": "positive",
        "description": "Customer asks for an exchange, a size swap, or store credit rather than cash. (Troca, troca de tamanho ou crédito de loja.)"
      }
    ],
    "context": "manager_review",
    "source": "EX-001"
  }
}
```

`cf_factors_fired` and `cf_trace` are the same list. `combination` is `initial` on the first step, then `positive`, `negative`, or `conflict`.

The orchestrator copies this object onto `DecisaoResponse.uncertaintyCf` and renames keys to camelCase: `finalCf`, `linguisticLabel`, `cfFactorsFired`, `cfTrace`, `runningCf`. Drools responses leave `uncertaintyCf` null until the Java advisor exists. The dashboard shows the card only for a Prolog verdict that carries the object.

## Checked examples

Scenario 1 (valid digital receipt, detached tags, exchange, day 29, `decisao(rever)`):

1. `CF0 = 0.50`
2. `0.50 + 0.40 * (1 - 0.50) = 0.70`
3. `0.70 + 0.45 * (1 - 0.70) = 0.835`, rounded to `0.84`

Label: Almost Certainly Approve. Context: `manager_review`.

PT-004 path (valid proof, `revendivel(true)`, day 45, derived `meio_reembolso(credito_loja)`):

1. `CF0 = 0.50`
2. `0.50 + 0.60 * (1 - 0.50) = 0.80`
3. `0.80 + 0.45 * (1 - 0.80) = 0.89`

Day 45 is outside both `31–35` and `> 60`, so those factors do not fire.
