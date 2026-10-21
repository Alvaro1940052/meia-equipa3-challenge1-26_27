"""Tests for the grouped inference history: per-case engine summary and product names."""

from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

from app.schemas.levis import PedidoAvaliacaoRequest
from app.services.inferences_service import _extract_product_info, _limpar_nome_produto, _resumo_motores


def test_product_name_uses_brand_value_not_enum_name():
    pedido = PedidoAvaliacaoRequest.model_validate(
        {"artigos": [{"id": "A-01", "produto": {"sku": "501-ORIGINAL-FIT", "marca": "LEVIS"}}]}
    )

    nome, ref = _extract_product_info(pedido)

    assert nome == "LEVIS 501-ORIGINAL-FIT"
    assert ref == "501-ORIGINAL-FIT"


def test_product_names_stored_before_the_fix_are_cleaned():
    assert _limpar_nome_produto("MarcaEnum.LEVIS 501-ORIGINAL-FIT") == "LEVIS 501-ORIGINAL-FIT"
    assert _limpar_nome_produto("LEVIS 501-ORIGINAL-FIT") == "LEVIS 501-ORIGINAL-FIT"


def _registo(motor: str, elegibilidade: str) -> SimpleNamespace:
    return SimpleNamespace(motor=motor, elegibilidade=elegibilidade, id=uuid4())


def test_single_engine_has_no_consensus():
    motores, consenso = _resumo_motores([_registo("DROOLS", "PERMITIR")])

    assert [m.motor for m in motores] == ["DROOLS"]
    assert consenso is None


def test_both_engines_agree():
    motores, consenso = _resumo_motores([_registo("PROLOG", "RECUSAR"), _registo("DROOLS", "RECUSAR")])

    assert [(m.motor, m.elegibilidade) for m in motores] == [("DROOLS", "RECUSAR"), ("PROLOG", "RECUSAR")]
    assert consenso is True


def test_both_engines_diverge():
    _, consenso = _resumo_motores([_registo("PROLOG", "REVER"), _registo("DROOLS", "PERMITIR")])

    assert consenso is False


def test_only_the_latest_inference_of_each_engine_counts():
    # Records come newest first: the newer Prolog PERMITIR replaces the older Prolog REVER
    registos = [
        _registo("PROLOG", "PERMITIR"),
        _registo("DROOLS", "PERMITIR"),
        _registo("PROLOG", "REVER"),
    ]

    motores, consenso = _resumo_motores(registos)

    assert [(m.motor, m.elegibilidade) for m in motores] == [("DROOLS", "PERMITIR"), ("PROLOG", "PERMITIR")]
    assert motores[1].id == registos[0].id
    assert consenso is True
