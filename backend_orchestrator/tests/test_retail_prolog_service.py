"""Tests for RetailPrologService and official reference scenarios (1, 2, 7, 10, etc.)."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.clients.prolog_client import PrologClient
from app.core.config import settings
from app.schemas.levis import ElegibilidadeEnum
from app.services.retail_prolog_service import RetailPrologService, pedido_to_prolog_facts


def _get_service() -> RetailPrologService:
    url = getattr(settings, "PROLOG_ENGINE_URL", getattr(settings, "prolog_engine_url", "http://localhost:8080"))
    client = PrologClient(base_url=url)
    return RetailPrologService(prolog_client=client)


@pytest.mark.asyncio
async def test_hard_stop_maps_to_terminal_decision():
    """A hard stop reported by the engine makes the decision terminal with the stop's outcome."""
    client = AsyncMock()
    client.evaluate_retail.return_value = {
        "status": "success",
        "decision": "rejected",
        "retail_decision": "recusar",
        "hard_stop": "HS-003",
        "justification": ["[HS-003] Recusar produtos personalizados, alterados ou embainhados."],
        "derived_facts": [{"id": 5, "fact": "decisao(recusar)", "rule_id": "HS-003", "justified_by": []}],
        "total_facts": 5,
    }
    res = await RetailPrologService(prolog_client=client).evaluate_return({"compraOriginal": {"canal": "MAINLINE"}})

    assert res.terminal is True
    assert res.elegibilidade == ElegibilidadeEnum.RECUSAR
    assert all(a.terminal for a in res.artigos)


@pytest.mark.asyncio
async def test_missing_data_after_hard_stop_asks_nothing():
    """O que falta? after a terminal hard stop: nothing is missing and the stop is reported."""
    client = AsyncMock()
    client.interactive_retail.return_value = {
        "status": "completed",
        "decision": "rejected",
        "retail_decision": "recusar",
        "hard_stop": "CH-008",
    }
    res = await RetailPrologService(prolog_client=client).missing_data({"compraOriginal": {"canal": "GROSSISTA"}})

    assert res.terminal is True
    assert res.paragem == "CH-008"
    assert res.completo is True
    assert res.dados == []


@pytest.mark.asyncio
async def test_scenario_1():
    """Scenario 1: Loose tags, exchange on day 29 (REVER, no TN-006)."""
    service = _get_service()
    sc = service.get_example_scenario_by_id(1)
    assert sc is not None
    res = await service.evaluate_return(sc)

    assert str(res.elegibilidade.value if hasattr(res.elegibilidade, "value") else res.elegibilidade) == "REVER"
    rule_codes = [r.codigoRegra for r in res.regras if r.codigoRegra]
    assert "TN-006" not in rule_codes


@pytest.mark.asyncio
async def test_scenario_2():
    """Scenario 2: Online Afterpay exchange exception (ENCAMINHAR, HS-005, TN-010, EX-006)."""
    service = _get_service()
    sc = service.get_example_scenario_by_id(2)
    assert sc is not None
    res = await service.evaluate_return(sc)

    assert str(res.elegibilidade.value if hasattr(res.elegibilidade, "value") else res.elegibilidade) == "ENCAMINHAR"
    rule_codes = [r.codigoRegra for r in res.regras if r.codigoRegra]
    assert "HS-005" in rule_codes
    assert "TN-010" in rule_codes
    assert "EX-006" in rule_codes


@pytest.mark.asyncio
async def test_scenario_7():
    """Scenario 7: Interac in Canada without original card (REVER, TN-011)."""
    service = _get_service()
    sc = service.get_example_scenario_by_id(7)
    assert sc is not None
    res = await service.evaluate_return(sc)

    assert str(res.elegibilidade.value if hasattr(res.elegibilidade, "value") else res.elegibilidade) == "REVER"
    rule_codes = [r.codigoRegra for r in res.regras if r.codigoRegra]
    assert "TN-011" in rule_codes


@pytest.mark.asyncio
async def test_scenario_10():
    """Scenario 10: Online late exchange with PayPal during portal outage (REVER, TN-008)."""
    service = _get_service()
    sc = service.get_example_scenario_by_id(10)
    assert sc is not None
    res = await service.evaluate_return(sc)

    assert str(res.elegibilidade.value if hasattr(res.elegibilidade, "value") else res.elegibilidade) == "REVER"
    rule_codes = [r.codigoRegra for r in res.regras if r.codigoRegra]
    assert "TN-008" in rule_codes


def test_afterpay_facts_physical_vs_online():
    """Verify afterpay_pede_excecao fact is ONLY emitted when online and exchange/exception."""
    # Physical in-store regular return: NO HS-005 / NO afterpay_pede_excecao
    pedido_fisico = {
        "tipoPedido": "devolucao",
        "compraOriginal": {
            "canal": "mainline",
            "pagamento": {"meio": "afterpay"}
        }
    }
    facts_fisico = pedido_to_prolog_facts(pedido_fisico)
    assert "meio_pagamento(afterpay)" in facts_fisico
    assert "afterpay_pede_excecao(true)" not in facts_fisico

    # Online exchange: DOES emit afterpay_pede_excecao
    pedido_online_troca = {
        "tipoPedido": "troca",
        "compraOriginal": {
            "canal": "levi_com",
            "pagamento": {"meio": "afterpay"}
        }
    }
    facts_online = pedido_to_prolog_facts(pedido_online_troca)
    assert "meio_pagamento(afterpay)" in facts_online
    assert "afterpay_pede_excecao(true)" in facts_online


def test_saldo_reembolsavel_tn006_facts():
    """Verify saldo_reembolsavel(true) is emitted when original paid > exchange items price."""
    pedido_troca_saldo = {
        "tipoPedido": "troca",
        "compraOriginal": {
            "pagamento": {"meio": "credito", "valorPago": 120.0}
        },
        "artigosTroca": [
            {"precoVenda": 80.0}
        ]
    }
    facts = pedido_to_prolog_facts(pedido_troca_saldo)
    assert "saldo_reembolsavel(true)" in facts


def test_acesso_aplicacao_pagamento_facts():
    """Verify acesso_aplicacao_pagamento(false) is mapped when false."""
    pedido_paypal = {
        "tipoPedido": "devolucao",
        "compraOriginal": {
            "pagamento": {"meio": "paypal", "acessoAplicacaoPagamento": False}
        }
    }
    facts = pedido_to_prolog_facts(pedido_paypal)
    assert "acesso_aplicacao_pagamento(false)" in facts


def test_online_order_not_found_and_blind_return_policy_facts():
    """CH-003 / CH-004 need the order lookup result and the blind-return policy, as in Drools."""
    facts = pedido_to_prolog_facts({
        "tipoPedido": "devolucao",
        "politicaPermiteAsCegasOnline": False,
        "compraOriginal": {"canal": "levi_com", "encomendaEncontrada": False},
    })
    assert "encomenda_encontrada(false)" in facts
    assert "politica_permite_as_cegas_online(false)" in facts


def test_soiled_item_keeps_its_condition_of_use():
    """PC-008 only isolates the item: the condition of use still decides eligibility."""
    facts = pedido_to_prolog_facts({
        "artigos": [{"estado": {"condicaoUso": "USADO", "sujoOuInseguro": True}}],
    })
    assert "estado_produto(sujo_contaminado_inseguro)" in facts
    assert "estado_produto(claramente_usado)" in facts


def test_price_adjustment_digital_original_receipt_and_previous_adjustment():
    """PT-007 accepts an original printed or digital receipt and is a one-time adjustment."""
    facts = pedido_to_prolog_facts({
        "tipoPedido": "ajuste_preco",
        "comprovativo": {"tipo": "CONFIRMACAO_ENCOMENDA", "reciboOriginal": True},
        "compraOriginal": {"canal": "mainline", "ajustePrecoAplicado": True},
    })
    assert "recibo_original(true)" in facts
    assert "ajuste_preco_anterior(true)" in facts


def test_price_adjustment_without_proof_has_no_original_receipt():
    """A blind price adjustment (no comprovativo) lacks the original receipt, so PT-008 refuses it."""
    facts = pedido_to_prolog_facts({
        "tipoPedido": "ajuste_preco",
        "comprovativo": None,
        "compraOriginal": {"canal": "mainline"},
    })
    assert "comprovativo(nenhum)" in facts
    assert "recibo_original(false)" in facts


def test_exception_facts_for_ex_006_and_hs_005():
    """EX-006 needs to know the exception bypasses a control; HS-005 only for online Afterpay."""
    loja_afterpay_com_excecao = pedido_to_prolog_facts({
        "tipoPedido": "devolucao",
        "excecaoGerencia": True,
        "pedidoExcecao": {"aprovada": True, "contornaProcessoObrigatorio": False},
        "compraOriginal": {"canal": "mainline", "pagamento": {"meio": "afterpay"}},
    })
    assert "tentativa_excecao(true)" in loja_afterpay_com_excecao
    assert "afterpay_pede_excecao(true)" not in loja_afterpay_com_excecao
    assert "excecao_contorna_controlo(true)" not in loja_afterpay_com_excecao

    contorna = pedido_to_prolog_facts({
        "tipoPedido": "devolucao",
        "pedidoExcecao": {"contornaProcessoObrigatorio": True},
        "compraOriginal": {"canal": "levi_com", "pagamento": {"meio": "afterpay"}},
    })
    assert "afterpay_pede_excecao(true)" in contorna
    assert "excecao_contorna_controlo(true)" in contorna


def test_refused_exception_comes_from_the_engine_fact():
    """excecaoRecusada reflects excecao_recusada(true) (HS-005 / EX-006), not the eligibility."""
    service = RetailPrologService(prolog_client=AsyncMock())
    raw = {
        "status": "success",
        "decision": "rejected",
        "retail_decision": "encaminhar",
        "hard_stop": None,
        "justification": [],
        "derived_facts": [
            {"id": 30, "fact": "decisao(encaminhar)", "rule_id": "CH-002", "justified_by": []},
            {"id": 31, "fact": "processo_obrigatorio(backpocket)", "rule_id": "CH-002", "justified_by": []},
        ],
        "total_facts": 31,
    }
    pedido = {"compraOriginal": {"canal": "LEVI_COM"}}
    assert service._map_prolog_to_decisao(raw, pedido).excecaoRecusada is False

    raw["derived_facts"].append({"id": 32, "fact": "excecao_recusada(true)", "rule_id": "HS-005", "justified_by": []})
    assert service._map_prolog_to_decisao(raw, pedido).excecaoRecusada is True


def _raw_engine_result(retail_decision: str, decision: str, regras_a_validar=None) -> dict:
    return {
        "status": "success",
        "decision": decision,
        "retail_decision": retail_decision,
        "hard_stop": None,
        "justification": [],
        "regras_a_validar": regras_a_validar or [],
        "derived_facts": [{"id": 20, "fact": "decisao(permitir)", "rule_id": "PT-003", "justified_by": []}],
        "total_facts": 20,
    }


def test_no_deciding_rule_goes_to_review_not_refusal():
    """nao_concluido (no rule decided) must not become RECUSAR without a justifying rule."""
    service = RetailPrologService(prolog_client=AsyncMock())
    raw = _raw_engine_result("nao_concluido", "manager_override")
    raw["derived_facts"] = []
    res = service._map_prolog_to_decisao(raw, {"compraOriginal": {"canal": "MAINLINE"}})
    assert res.elegibilidade == ElegibilidadeEnum.REVER


def test_engine_decision_is_used_as_is():
    """The engine already returns the most severe decision (Drools order); the mapper keeps it."""
    service = RetailPrologService(prolog_client=AsyncMock())
    raw = _raw_engine_result("rever", "manager_override")
    raw["derived_facts"].append({"id": 21, "fact": "decisao(rever)", "rule_id": "TN-011", "justified_by": []})
    res = service._map_prolog_to_decisao(raw, {"compraOriginal": {"canal": "MAINLINE"}})
    assert res.elegibilidade == ElegibilidadeEnum.REVER


def test_rules_to_validate_come_from_the_engine():
    """regrasAValidar lists the fired rules marked "a validar" in the KB, never a fixed list."""
    service = RetailPrologService(prolog_client=AsyncMock())
    pedido = {"compraOriginal": {"canal": "MAINLINE"}}
    res = service._map_prolog_to_decisao(_raw_engine_result("permitir", "approved", ["PT-003"]), pedido)
    assert res.regrasAValidar == ["PT-003"]

    res = service._map_prolog_to_decisao(_raw_engine_result("rever", "manager_override"), pedido)
    assert res.regrasAValidar == []


@pytest.mark.asyncio
async def test_explain_why_all_input_codes():
    """Verify explain_why returns accurate Prolog questions, rules, and waiting candidates."""
    service = _get_service()
    codes = [
        "IN-001", "IN-002", "IN-003", "IN-004", "IN-005",
        "IN-006", "IN-007", "IN-008", "IN-009", "IN-010",
        "EP-001", "EX-001", "EX-002",
    ]

    for code in codes:
        resp = await service.explain_why(code, {})
        assert resp.codigo == code
        assert resp.dado == code
        assert resp.pergunta is not None and len(resp.pergunta) > 10
        assert resp.resumo is not None and len(resp.resumo) > 15
        assert len(resp.regrasQueDependem) > 0
        if resp.regrasEmEspera:
            first_wait = resp.regrasEmEspera[0]
            assert first_wait.codigoRegra is not None
            assert first_wait.modulo is not None
            assert len(first_wait.condicoesDoDado) > 0


@pytest.mark.asyncio
async def test_explain_why_with_dynamic_waiting_rules():
    """Verify explain_why dynamically evaluates rules in waiting when scenario facts are present."""
    service = _get_service()
    # Scenario where payment is Interac with physical card present, but mercado is pending (IN-001)
    interac_pending_market_payload = {
        "compraOriginal": {
            "pagamento": {
                "meio": "interac",
                "cartaoFisicoPresente": True,
            }
        },
    }
    # When asking why IN-001 (mercado) is needed, TN-011 is waiting solely for mercado(canada)
    resp = await service.explain_why("IN-001", interac_pending_market_payload)
    assert resp.codigo == "IN-001"
    assert "TN-011" in resp.regrasQueDependem
    assert len(resp.regrasEmEspera) >= 1
    waiting_rule_codes = [r.codigoRegra for r in resp.regrasEmEspera]
    assert "TN-011" in waiting_rule_codes
    assert "TN-011" in resp.resumo


@pytest.mark.asyncio
async def test_explain_why_unknown_code_fallback():
    """Verify explain_why returns a graceful fallback when given an unknown code."""
    service = _get_service()
    resp = await service.explain_why("UNKNOWN-999", {})
    assert resp.codigo == "UNKNOWN-999"
    assert "UNKNOWN-999" in resp.pergunta
    assert resp.regrasQueDependem == []
    assert resp.regrasEmEspera == []

