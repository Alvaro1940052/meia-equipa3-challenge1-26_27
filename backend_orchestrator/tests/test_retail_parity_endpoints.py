"""Tests for Retail Prolog parity endpoints (/retail/avaliar, /retail/cenarios-exemplo, etc.)."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app





@pytest.mark.asyncio
async def test_listar_cenarios_exemplo(async_client: AsyncClient):
    """Ensure /api/v1/retail/cenarios-exemplo returns all 10 scenarios."""
    resp = await async_client.get("/api/v1/retail/cenarios-exemplo")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 10
    assert data[0]["id"] == 1
    assert "pedido" in data[0]


@pytest.mark.asyncio
async def test_obter_cenario_exemplo_id(async_client: AsyncClient):
    """Ensure /api/v1/retail/cenarios-exemplo/1 returns Scenario 1."""
    resp = await async_client.get("/api/v1/retail/cenarios-exemplo/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 1
    assert "As etiquetas soltas" in data["titulo"]


@pytest.mark.asyncio
async def test_avaliar_cenario_1(async_client: AsyncClient):
    """Ensure /api/v1/retail/avaliar evaluates Scenario 1 and returns DecisaoResponse."""
    sc_resp = await async_client.get("/api/v1/retail/cenarios-exemplo/1")
    sc_data = sc_resp.json()

    resp = await async_client.post("/api/v1/retail/avaliar", json=sc_data["pedido"])
    assert resp.status_code == 200
    dec = resp.json()

    assert dec["elegibilidade"] == "REVER"
    assert dec["tipoTransacao"] == "TROCA"
    assert "avaliacaoId" in dec
    assert len(dec["regras"]) > 0

    # Test explain how
    eval_id = dec["avaliacaoId"]
    how_resp = await async_client.get(f"/api/v1/retail/avaliacoes/{eval_id}/explicacoes/como")
    assert how_resp.status_code == 200
    how_data = how_resp.json()
    assert len(how_data["passos"]) > 0

    # Test explain why not
    wn_resp = await async_client.get(
        f"/api/v1/retail/avaliacoes/{eval_id}/explicacoes/porque-nao?conclusao=OUT-001:PERMITIR"
    )
    assert wn_resp.status_code == 200
    wn_data = wn_resp.json()
    assert wn_data["valor"] == "PERMITIR"


@pytest.mark.asyncio
async def test_retail_health(async_client: AsyncClient):
    """Ensure /api/v1/retail/health reports UP."""
    resp = await async_client.get("/api/v1/retail/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "UP"
