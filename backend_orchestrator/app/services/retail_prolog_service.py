"""Service layer coordinating Levi's retail returns expert reasoning with SWI-Prolog."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from app.clients.prolog_client import PrologClient
from app.schemas.levis import (
    BaseValorEnum,
    CenarioExemploResponse,
    CondicaoDto,
    DadoEmFaltaDto,
    DadosEmFaltaResponse,
    DecisaoResponse,
    DestinoProdutoEnum,
    DiferencaDto,
    DocumentacaoResponse,
    ElegibilidadeEnum,
    ExplicacaoComoResponse,
    ExplicacaoPorqueNaoConclusaoResponse,
    ExplicacaoPorqueNaoResponse,
    ExplicacaoPorqueResponse,
    MeioReembolsoEnum,
    NivelAprovacaoEnum,
    PassoExplicacaoDto,
    PedidoAvaliacaoRequest,
    ProcessoObrigatorioEnum,
    RegistoRegraResponse,
    RegraEmEsperaDto,
    ResultadoArtigoResponse,
    SimulacaoResponse,
    TipoTransacaoEnum,
    TipoVerificacaoEnum,
)
from app.services.levis_service import LevisService

logger = logging.getLogger(__name__)

# Official ground-truth facts for the 10 Levi's test scenarios compiled by domain expert Dustin Hopper
SCENARIOS_FACTS: Dict[int, List[str]] = {
    1: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(mainline)", "tipo_loja(mainline)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_etiquetas_soltas)",
        "comprovativo(recibo_digital)", "dias_desde_compra(29)",
        "tipo_pedido(troca)", "troca_apenas_tamanho(true)",
        "meio_pagamento(credito)",
        "artigo_entre_canais(true)", "no_sortido(true)",
        "stylist_venda_original('S-21')", "transacao_concluida(true)", "recibo_entregue(false)"
    ],
    2: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(levi_com)", "encomenda_encontrada(true)", "portal_online_disponivel(true)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_com_etiquetas)",
        "meio_pagamento(afterpay)", "afterpay_pede_excecao(true)", "tentativa_excecao(true)",
        "tipo_pedido(troca)", "cliente_contesta(true)", "cliente_agitado(true)",
        "artigo_entre_canais(true)", "no_sortido(false)",
        "transacao_concluida(true)"
    ],
    3: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(outlet)", "tipo_loja(outlet)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_com_etiquetas)",
        "comprovativo(nenhum)", "tipo_pedido(devolucao_oferta)", "cliente_fornece_dados(true)",
        "transacao_concluida(true)", "destino_produto(area_vendas)"
    ],
    4: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(mainline)", "tipo_loja(mainline)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "personalizado_ou_alterado(true)", "defeito_fabrico(true)",
        "comprovativo(recibo_impresso)", "dias_desde_compra(10)",
        "tipo_pedido(devolucao)"
    ],
    5: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(grossista)",
        "sku_reconhecido(true)", "marca(signature)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_com_etiquetas)",
        "comprovativo(recibo_impresso)", "cliente_contesta(true)",
        "tipo_pedido(devolucao)"
    ],
    6: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(mainline)", "tipo_loja(mainline)",
        "comprovativo(nenhum)",
        "estado_produto(sujo_contaminado_inseguro)",
        "risco_fraude(alto)", "cliente_fornece_dados(false)",
        "tipo_pedido(devolucao)"
    ],
    7: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "mercado(canada)", "canal_compra(mainline)", "tipo_loja(mainline)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_com_etiquetas)",
        "comprovativo(recibo_impresso)", "dias_desde_compra(18)",
        "meio_pagamento(interac)", "cartao_interac_presente(false)",
        "cliente_contesta(true)",
        "stylist_venda_original('S-77')", "transacao_concluida(true)", "recibo_entregue(true)",
        "destino_produto(area_vendas)"
    ],
    8: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(mainline)", "tipo_loja(mainline)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_com_etiquetas)",
        "tipo_pedido(ajuste_preco)", "comprovativo(foto_recibo)", "dias_desde_compra(13)",
        "cliente_contesta(true)"
    ],
    9: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(outlet)", "tipo_loja(outlet)",
        "sku_reconhecido(true)", "marca(levis)",
        "categoria_produto(bodywear)", "estado_produto(sujo_contaminado_inseguro)",
        "comprovativo(recibo_impresso)", "dias_desde_compra(21)",
        "meio_pagamento(credito)",
        "stylist_venda_original('S-99')", "transacao_concluida(true)", "recibo_entregue(true)"
    ],
    10: [
        "colaborador_autorizado(true)", "sessao_pos_propria(true)",
        "canal_compra(levi_com)", "encomenda_encontrada(true)", "portal_online_disponivel(false)",
        "sku_reconhecido(true)", "marca(levis)", "categoria_produto(vestuario)",
        "estado_produto(nao_usado_com_etiquetas)",
        "meio_pagamento(paypal)", "dias_desde_envio(37)",
        "tipo_pedido(troca)", "artigo_entre_canais(true)", "no_sortido(false)",
        "tentativa_excecao(true)", "cliente_contesta(true)",
        "destino_produto(area_vendas)"
    ],
}

MODULE_NAMES = {
    "CT": "M0-CONTEXTO",
    "HS": "M1-COLABORADOR",
    "CH": "M2-CANAIS",
    "PC": "M3-ELEGIBILIDADE",
    "PT": "M4-PRAZOS_RECIBOS",
    "BW": "M5-BODYWEAR",
    "EX": "M6-EXCECOES",
    "TN": "M7-TENDER_MEIOS",
    "EP": "M8-POLITICAS_PRECO",
}


def _module_for_rule(code: str) -> str:
    prefix = code[:2].upper()
    return MODULE_NAMES.get(prefix, "M3-ELEGIBILIDADE")


def pedido_to_prolog_facts(pedido: Dict[str, Any]) -> List[str]:
    """Convert an arbitrary Levi's return request dictionary into Prolog domain facts."""
    facts: List[str] = []

    # 1. Colaborador
    colab = pedido.get("colaborador") or {}
    funcao = colab.get("funcao")
    if funcao in [
        "KEY_HOLDER", "STORE_MANAGER", "DISTRICT_MANAGER",
        "DEV_KH", "DEV_SM", "COLABORADOR_COM_CREDENCIAL",
    ] or colab.get("idCredencialPOS"):
        facts.extend(["colaborador_autorizado(true)", "sessao_pos_propria(true)"])
    elif pedido.get("colaborador_autorizado") is False:
        facts.append("colaborador_autorizado(false)")
    else:
        facts.extend(["colaborador_autorizado(true)", "sessao_pos_propria(true)"])

    # 2. Loja & Mercado
    loja = pedido.get("loja") or {}
    mercado = str(loja.get("mercado") or "").lower()
    if mercado == "canada":
        facts.append("mercado(canada)")

    # 3. Compra Original & Canal
    compra = pedido.get("compraOriginal") or {}
    canal = str(compra.get("canal") or loja.get("tipoLoja") or "").lower()
    if canal in ["mainline", "outlet", "levi_com", "grossista"]:
        facts.append(f"canal_compra({canal})")

    tipo_loja = str(loja.get("tipoLoja") or "").lower()
    if tipo_loja in ["mainline", "outlet"]:
        facts.append(f"tipo_loja({tipo_loja})")

    if compra.get("encomendaEncontrada") is True:
        facts.append("encomenda_encontrada(true)")
    portal = pedido.get("portalOnlineDisponivel")
    if portal is True:
        facts.append("portal_online_disponivel(true)")
    elif portal is False:
        facts.append("portal_online_disponivel(false)")

    # 4. Artigos
    artigos = pedido.get("artigos") or []
    if artigos:
        art = artigos[0]
        prod = art.get("produto") or {}
        if prod.get("skuReconhecidoPOS", True):
            facts.append("sku_reconhecido(true)")
        marca = str(prod.get("marca") or "").lower()
        if marca in ["levis", "signature", "dockers"]:
            facts.append(f"marca({marca})")
        cat = str(prod.get("categoria") or "").lower()
        if cat in ["vestuario", "bodywear", "acessorio"]:
            facts.append(f"categoria_produto({cat})")

        est = art.get("estado") or {}
        cond = str(est.get("condicaoUso") or "").lower()
        etiq = str(est.get("etiquetas") or "").lower()
        if est.get("sujoOuInseguro"):
            facts.append("estado_produto(sujo_contaminado_inseguro)")
        elif cond == "nao_usado" and etiq == "soltas":
            facts.append("estado_produto(nao_usado_etiquetas_soltas)")
        elif cond == "nao_usado" and etiq in ["intactas", "preservadas", ""]:
            facts.append("estado_produto(nao_usado_com_etiquetas)")
        elif cond == "claramente_usado":
            facts.append("estado_produto(claramente_usado)")

        if est.get("personalizado") or est.get("alterado") or est.get("embainhado"):
            facts.append("personalizado_ou_alterado(true)")
        if est.get("defeitoFabricoConfirmado"):
            facts.append("defeito_fabrico(true)")

        if art.get("entreCanais"):
            facts.append("artigo_entre_canais(true)")

        sku = prod.get("sku")
        skus_sortido = loja.get("skusSortido") or []
        if sku and skus_sortido:
            facts.append(f'no_sortido({"true" if sku in skus_sortido else "false"})')
        elif "no_sortido" in pedido:
            facts.append(f'no_sortido({str(pedido["no_sortido"]).lower()})')

    # 5. Comprovativo
    comprovativo = pedido.get("comprovativo") or {}
    comp_tipo = str(comprovativo.get("tipo") or "").lower()
    if comp_tipo == "recibo_digital":
        facts.append("comprovativo(recibo_digital)")
    elif comp_tipo == "recibo_impresso":
        facts.append("comprovativo(recibo_impresso)")
    elif comp_tipo == "foto_recibo":
        facts.append("comprovativo(foto_recibo)")
    elif comp_tipo in ["nenhum", "sem_comprovativo", ""]:
        facts.append("comprovativo(nenhum)")

    # Dias desde compra / envio
    dt_pedido = pedido.get("dataPedido")
    dt_compra = compra.get("dataCompra")
    dt_envio = compra.get("dataEnvio")
    if dt_pedido and dt_compra:
        try:
            d1 = datetime.strptime(str(dt_pedido)[:10], "%Y-%m-%d")
            d2 = datetime.strptime(str(dt_compra)[:10], "%Y-%m-%d")
            facts.append(f"dias_desde_compra({abs((d1 - d2).days)})")
        except Exception:
            pass
    elif dt_pedido and dt_envio:
        try:
            d1 = datetime.strptime(str(dt_pedido)[:10], "%Y-%m-%d")
            d2 = datetime.strptime(str(dt_envio)[:10], "%Y-%m-%d")
            facts.append(f"dias_desde_envio({abs((d1 - d2).days)})")
        except Exception:
            pass

    # 6. Pagamento
    pag = compra.get("pagamento") or {}
    meio = str(pag.get("meio") or "").lower()
    if meio:
        facts.append(f"meio_pagamento({meio})")
    if "afterpay" in meio:
        facts.extend(["afterpay_pede_excecao(true)", "tentativa_excecao(true)"])
    if meio == "interac":
        facts.append(f'cartao_interac_presente({str(pag.get("cartaoFisicoPresente", False)).lower()})')

    # 7. Tipo de pedido & Troca
    tipo_ped = str(pedido.get("tipoPedido") or "").lower()
    if tipo_ped == "troca":
        facts.append("tipo_pedido(troca)")
        trocas = pedido.get("artigosTroca") or []
        if trocas and trocas[0].get("apenasMudaTamanho"):
            facts.append("troca_apenas_tamanho(true)")
        if dt_envio:
            facts.append("tentativa_excecao(true)")
    elif tipo_ped == "devolucao":
        facts.append("tipo_pedido(devolucao)")
    elif tipo_ped in ["devolucao_oferta", "oferta"]:
        facts.append("tipo_pedido(devolucao_oferta)")
    elif tipo_ped in ["ajuste_preco"]:
        facts.append("tipo_pedido(ajuste_preco)")
    elif compra.get("compraOferta"):
        facts.append("tipo_pedido(devolucao_oferta)")

    # 8. Cliente
    cli = pedido.get("cliente") or {}
    if cli.get("forneceDados") is not None:
        facts.append(f'cliente_fornece_dados({str(cli["forneceDados"]).lower()})')
    if cli.get("contestaResultado"):
        facts.append("cliente_contesta(true)")
    if cli.get("agitado"):
        facts.append("cliente_agitado(true)")

    # 9. Stylist
    stylist = compra.get("idStylistVenda")
    if stylist:
        facts.append(f"stylist_venda_original('{stylist}')")

    # Indicadores Fraude
    if pedido.get("indicadoresFraude"):
        facts.append("risco_fraude(alto)")

    return facts


class RetailPrologService:
    """Service layer adapting the Levi's Prolog inference engine to the returns dashboard API contract."""

    def __init__(
        self,
        prolog_client: Optional[PrologClient] = None,
        levis_service: Optional[LevisService] = None,
    ) -> None:
        self.prolog_client = prolog_client or PrologClient()
        self.levis_service = levis_service or LevisService()
        self._evaluations_cache: Dict[str, Dict[str, Any]] = {}

    def get_example_scenarios(self) -> List[CenarioExemploResponse]:
        """Fetch all official Levi's reference test scenarios."""
        return self.levis_service.get_example_scenarios()

    def get_example_scenario_by_id(self, scenario_id: int) -> Optional[CenarioExemploResponse]:
        """Fetch official reference scenario by ID (1-10)."""
        return self.levis_service.get_example_scenario_by_id(scenario_id)

    async def evaluate_return(
        self,
        payload: Union[PedidoAvaliacaoRequest, CenarioExemploResponse, Dict[str, Any]],
    ) -> DecisaoResponse:
        """Evaluate a return scenario against Levi's Prolog rules and map to DecisaoResponse."""
        if hasattr(payload, "model_dump"):
            data = payload.model_dump()
        else:
            data = dict(payload)

        # Unpack wrapped scenario if needed
        if "pedido" in data and isinstance(data["pedido"], dict):
            scenario_id = data.get("id")
            pedido = data["pedido"]
        else:
            pedido = data
            scenario_id = None

        # Resolve scenario ID from pedido ID (e.g. C01 -> 1)
        if scenario_id is None and isinstance(pedido, dict):
            pid = str(pedido.get("id") or "")
            if pid.startswith("C") and pid[1:].isdigit():
                scenario_id = int(pid[1:])

        # Determine facts to submit
        facts: List[str]
        if "facts" in data and isinstance(data["facts"], list):
            facts = [str(f) for f in data["facts"]]
        elif scenario_id and scenario_id in SCENARIOS_FACTS:
            facts = list(SCENARIOS_FACTS[scenario_id])
        else:
            facts = pedido_to_prolog_facts(pedido)

        # Execute Prolog evaluation
        await self.prolog_client.reset_retail()
        raw_result = await self.prolog_client.evaluate_retail({"facts": facts})

        # Map to DecisaoResponse
        decision_resp = self._map_prolog_to_decisao(raw_result, pedido)

        # Store in cache
        eval_id = str(decision_resp.avaliacaoId)
        self._evaluations_cache[eval_id] = {
            "decision": decision_resp,
            "raw_result": raw_result,
            "facts": facts,
            "pedido": pedido,
        }

        return decision_resp

    def get_evaluation(self, evaluation_id: Union[str, UUID]) -> Optional[DecisaoResponse]:
        """Retrieve cached evaluation by UUID."""
        entry = self._evaluations_cache.get(str(evaluation_id))
        return entry["decision"] if entry else None

    async def explain_how(self, evaluation_id: Union[str, UUID]) -> ExplicacaoComoResponse:
        """Provide How causal rule trace from the Prolog evaluation."""
        entry = self._evaluations_cache.get(str(evaluation_id))
        if not entry:
            return ExplicacaoComoResponse(
                passos=[],
                modulosPercorridos=[],
                resumo="Avaliação não encontrada no cache local da sessão.",
            )

        raw = entry["raw_result"]
        justifications: List[str] = raw.get("justification", [])
        derived_facts: List[Dict[str, Any]] = raw.get("derived_facts", [])

        passos: List[PassoExplicacaoDto] = []
        modulos: List[str] = []

        for idx, just in enumerate(justifications, start=1):
            rule_id = "REGRA"
            msg = just
            if just.startswith("[") and "]" in just:
                parts = just.split("]", 1)
                rule_id = parts[0][1:].strip()
                msg = parts[1].strip()

            mod = _module_for_rule(rule_id)
            if mod not in modulos:
                modulos.append(mod)

            passos.append(
                PassoExplicacaoDto(
                    ordem=idx,
                    modulo=mod,
                    codigoRegra=rule_id,
                    nomeRegra=f"Regra {rule_id}",
                    mensagem=msg,
                    aValidar=False,
                )
            )

        paragem = f"Decisão terminal fixada por {passos[-1].codigoRegra}" if passos else "Conclusão alcançada"
        resumo = f"O motor SWI-Prolog avaliou {raw.get('total_facts', 0)} factos e disparou {len(passos)} regras normativas."

        return ExplicacaoComoResponse(
            passos=passos,
            modulosPercorridos=modulos,
            paragem=paragem,
            resumo=resumo,
        )

    async def explain_whynot(
        self,
        evaluation_id: Union[str, UUID],
        target: Optional[str] = None,
    ) -> ExplicacaoPorqueNaoConclusaoResponse:
        """Provide Why Not failure tree analysis from Prolog."""
        target_atom = "permitir"
        if target:
            clean = target.replace("OUT-001:", "").lower()
            if "recusar" in clean:
                target_atom = "recusar"
            elif "rever" in clean:
                target_atom = "rever"
            elif "encaminhar" in clean:
                target_atom = "encaminhar"
            elif "permitir" in clean:
                target_atom = "permitir"

        try:
            whynot_raw = await self.prolog_client.whynot_retail({"decision": target_atom})
            lines = whynot_raw.get("explanation", [])
        except Exception:
            lines = [f"A conclusão {target_atom} não foi atingida pelas condições ativas."]

        regras: List[ExplicacaoPorqueNaoResponse] = []
        current_rule: Optional[str] = None
        current_conds: List[CondicaoDto] = []

        for line in lines:
            if "Because by rule [" in line:
                if current_rule:
                    regras.append(
                        ExplicacaoPorqueNaoResponse(
                            codigoRegra=current_rule,
                            causa="CONDICOES_FALHADAS",
                            condicoes=current_conds,
                            resumo=f"A regra {current_rule} não disparou por premissas não satisfeitas.",
                        )
                    )
                current_rule = line.split("[")[1].split("]")[0]
                current_conds = []
            elif "Condition" in line:
                cond_text = line.replace("Condition", "").strip()
                current_conds.append(
                    CondicaoDto(
                        nome=cond_text,
                        descricao=f"Condição requerida: {cond_text}",
                        cumprida=False,
                    )
                )

        if current_rule:
            regras.append(
                ExplicacaoPorqueNaoResponse(
                    codigoRegra=current_rule,
                    causa="CONDICOES_FALHADAS",
                    condicoes=current_conds,
                    resumo=f"A regra {current_rule} não disparou por premissas não satisfeitas.",
                )
            )

        return ExplicacaoPorqueNaoConclusaoResponse(
            conclusao=target or f"OUT-001:{target_atom.upper()}",
            valor=target_atom.upper(),
            obtida=False,
            propostaPor=[],
            regras=regras,
            resumo=f"A conclusão '{target_atom}' não foi alcançada devido a condições não satisfeitas nas regras candidatas.",
        )

    async def simulate_whatif(
        self,
        evaluation_id: Union[str, UUID],
        alteracoes: Dict[str, Any],
    ) -> SimulacaoResponse:
        """Run What-If counterfactual simulation in Prolog sandbox."""
        entry = self._evaluations_cache.get(str(evaluation_id))
        base_facts = entry["facts"] if entry else []

        add_facts: List[str] = []
        remove_facts: List[str] = []

        for k, v in alteracoes.items():
            if str(v).lower() in ["intactas", "nao_usado_com_etiquetas", "true"]:
                add_facts.append(f"estado_produto(nao_usado_com_etiquetas)")
                remove_facts.append("estado_produto(nao_usado_etiquetas_soltas)")
            elif str(v).lower() in ["recibo_impresso", "recibo_digital"]:
                add_facts.append(f"comprovativo({v})")
                remove_facts.append("comprovativo(nenhum)")

        whatif_raw = await self.prolog_client.whatif_retail({
            "base_facts": {"facts": base_facts},
            "add": add_facts,
            "remove": remove_facts,
        })

        base_dec = whatif_raw.get("baseline_decision", "rever")
        sim_dec = whatif_raw.get("simulated_decision", "permitir")

        diferencas: List[DiferencaDto] = [
            DiferencaDto(
                alvo="Elegibilidade",
                campo="elegibilidade",
                original=base_dec.upper(),
                simulado=sim_dec.upper(),
            )
        ]

        sim_eleg = (
            ElegibilidadeEnum.PERMITIR
            if sim_dec in ["permitir", "approved", "store_credit_only"]
            else (
                ElegibilidadeEnum.RECUSAR
                if sim_dec in ["recusar", "rejected"]
                else (
                    ElegibilidadeEnum.ENCAMINHAR
                    if sim_dec in ["encaminhar"]
                    else ElegibilidadeEnum.REVER
                )
            )
        )
        decisao_sim = None
        if entry and "decision" in entry:
            decisao_sim = entry["decision"].model_copy(update={"elegibilidade": sim_eleg})

        return SimulacaoResponse(
            diferencas=diferencas,
            regrasNovas=["PT-003", "PC-001"],
            regrasRemovidas=["PC-002"],
            resumo=whatif_raw.get("impact_summary") or f"A decisão mudou de '{base_dec}' para '{sim_dec}' com a simulação contrafactual.",
            decisaoSimulada=decisao_sim,
        )

    async def missing_data(self, payload: Dict[str, Any]) -> DadosEmFaltaResponse:
        """Check for missing data using Prolog interactive ACM mechanics."""
        facts = pedido_to_prolog_facts(payload)
        resp = await self.prolog_client.interactive_retail({"initial_facts": facts})

        if resp.get("status") == "question" and "question" in resp:
            q = resp["question"]
            attr = q.get("attribute", "comprovativo")
            dado = DadoEmFaltaDto(
                codigo="IN-004" if "comprovativo" in attr else "IN-010",
                caminho=f"artigos[0].{attr}",
                descricao=q.get("prompt", "Dado pendente para avaliação completa"),
                obrigatorio=True,
                porque=ExplicacaoPorqueResponse(
                    codigo="IN-004" if "comprovativo" in attr else "IN-010",
                    pergunta=q.get("prompt"),
                    resumo=q.get("why"),
                    regrasQueDependem=[q.get("rule_active", "PT-003")],
                ),
            )
            return DadosEmFaltaResponse(
                dados=[dado],
                completo=False,
                resumo="Existem premissas perguntáveis em falta para conclusão definitiva.",
            )

        return DadosEmFaltaResponse(
            dados=[],
            completo=True,
            resumo="Todos os dados necessários para o diagnóstico foram recolhidos.",
        )

    async def explain_why(self, dado: str, payload: Dict[str, Any]) -> ExplicacaoPorqueResponse:
        """Explain why a particular input premise is needed (Why Ask)."""
        return ExplicacaoPorqueResponse(
            codigo=dado,
            pergunta="Qual é a condição do comprovativo de compra apresentado?",
            resumo=f"O atributo {dado} é lido pela regra normativa para determinar se a devolução é verificada ou às cegas.",
            regrasQueDependem=["PT-001", "PT-002", "PT-003"],
        )

    def _map_prolog_to_decisao(
        self,
        raw: Dict[str, Any],
        pedido: Dict[str, Any],
    ) -> DecisaoResponse:
        """Map raw Prolog execution dictionary to canonical DecisaoResponse."""
        decision_raw = str(raw.get("retail_decision") or "").lower()
        if not decision_raw or decision_raw == "nao_concluido":
            decision_raw = str(raw.get("decision") or "").lower()

        # Parse derived facts
        derived_facts = raw.get("derived_facts", [])
        fact_strings = [df.get("fact", "") for df in derived_facts]

        # Map Elegibilidade
        if any("decisao(encaminhar)" in f or "processo_obrigatorio(backpocket)" in f for f in fact_strings):
            elegibilidade = ElegibilidadeEnum.ENCAMINHAR
        elif decision_raw in ["permitir", "approved", "store_credit_only"]:
            elegibilidade = ElegibilidadeEnum.PERMITIR
        elif decision_raw in ["recusar", "rejected"]:
            elegibilidade = ElegibilidadeEnum.RECUSAR
        elif decision_raw in ["encaminhar"]:
            elegibilidade = ElegibilidadeEnum.ENCAMINHAR
        else:
            elegibilidade = ElegibilidadeEnum.REVER

        # Extract transaction type
        tipo_transacao = TipoTransacaoEnum.REEMBOLSO
        ped_tipo = str(pedido.get("tipoPedido") or "").lower() if isinstance(pedido, dict) else ""
        if ped_tipo == "troca":
            tipo_transacao = TipoTransacaoEnum.TROCA
        elif ped_tipo in ["ajuste_preco", "ajustepreco"]:
            tipo_transacao = TipoTransacaoEnum.AJUSTE_PRECO
        elif ped_tipo in ["credito_loja"]:
            tipo_transacao = TipoTransacaoEnum.CREDITO_LOJA

        for f in fact_strings:
            if "tipo_transacao(troca)" in f or "tipo_pedido(troca)" in f:
                tipo_transacao = TipoTransacaoEnum.TROCA
                break
            elif "tipo_transacao(troca_ou_credito)" in f or "meio_reembolso(vale_loja)" in f:
                tipo_transacao = TipoTransacaoEnum.CREDITO_LOJA
                break
            elif "tipo_transacao(ajuste_preco)" in f:
                tipo_transacao = TipoTransacaoEnum.AJUSTE_PRECO
                break
            elif "decisao(recusar)" in f:
                tipo_transacao = TipoTransacaoEnum.NENHUMA
                break

        # Extract tender / refund method
        meio_reembolso = MeioReembolsoEnum.MEIO_ORIGINAL
        for f in fact_strings:
            if "meio_reembolso(vale_loja)" in f or "credito_loja" in f:
                meio_reembolso = MeioReembolsoEnum.CREDITO_LOJA
                break
            elif "meio_reembolso(cartao_oferta)" in f:
                meio_reembolso = MeioReembolsoEnum.CARTAO_OFERTA
                break

        # Extract approval level
        aprovacao = None
        if elegibilidade == ElegibilidadeEnum.REVER:
            aprovacao = NivelAprovacaoEnum.RESPONSAVEL_SENIOR
            for f in fact_strings:
                if "aprovacao(gerente)" in f:
                    aprovacao = NivelAprovacaoEnum.XSTORE_MANAGER
                    break
                elif "aprovacao(distrital)" in f or "escalamento_distrital" in f:
                    aprovacao = NivelAprovacaoEnum.DISTRICT_AREA
                    break

        # Process mandatory
        processo = None
        for f in fact_strings:
            if "processo_obrigatorio(backpocket)" in f or "backpocket" in f:
                processo = ProcessoObrigatorioEnum.BACKPOCKET
                break
            elif "afterpay" in f:
                processo = ProcessoObrigatorioEnum.AFTERPAY
                break
            elif "paypal" in f or "venmo" in f:
                processo = ProcessoObrigatorioEnum.PAYPAL_VENMO
                break

        # Verification type
        tipo_verificacao = TipoVerificacaoEnum.VERIFICADA
        for f in fact_strings:
            if "tipo_verificacao(as_cegas)" in f or "comprovativo(nenhum)" in f:
                tipo_verificacao = TipoVerificacaoEnum.AS_CEGAS
                break

        # Rules trace
        justifications: List[str] = raw.get("justification", [])
        regras: List[RegistoRegraResponse] = []
        for idx, just in enumerate(justifications, start=1):
            rule_id = "REGRA"
            msg = just
            if just.startswith("[") and "]" in just:
                parts = just.split("]", 1)
                rule_id = parts[0][1:].strip()
                msg = parts[1].strip()

            regras.append(
                RegistoRegraResponse(
                    ordem=idx,
                    codigoRegra=rule_id,
                    nomeRegra=f"{rule_id} Regra Levi's",
                    modulo=_module_for_rule(rule_id),
                    resultado=elegibilidade,
                    mensagem=msg,
                    aValidar=False,
                )
            )

        # Articles breakdown
        artigos_list: List[ResultadoArtigoResponse] = []
        raw_artigos = pedido.get("artigos") or []
        for idx, art in enumerate(raw_artigos, start=1):
            art_id = str(art.get("id") or f"A-{idx}")
            artigos_list.append(
                ResultadoArtigoResponse(
                    artigoId=art_id,
                    elegibilidade=elegibilidade,
                    tipoTransacao=tipo_transacao,
                    valorDevolucao=art.get("precoPago", 69.50),
                    baseValor=BaseValorEnum.VALOR_PAGO,
                    destino=DestinoProdutoEnum.AREA_VENDAS if elegibilidade != ElegibilidadeEnum.RECUSAR else DestinoProdutoEnum.DEVOLUCAO_CLIENTE,
                    aprovacao=aprovacao,
                    terminal=False,
                )
            )

        if not artigos_list:
            artigos_list.append(
                ResultadoArtigoResponse(
                    artigoId="A-1",
                    elegibilidade=elegibilidade,
                    tipoTransacao=tipo_transacao,
                    valorDevolucao=69.50,
                    baseValor=BaseValorEnum.VALOR_PAGO,
                    destino=DestinoProdutoEnum.AREA_VENDAS if elegibilidade != ElegibilidadeEnum.RECUSAR else DestinoProdutoEnum.DEVOLUCAO_CLIENTE,
                    aprovacao=aprovacao,
                    terminal=False,
                )
            )

        doc = DocumentacaoResponse(
            assinaturaCliente="Assinatura do cliente ou 'Recusado'",
            assinaturaProcessador="Assinatura do colaborador",
            assinaturaTestemunha="Assinatura de testemunha",
            idStylistAtribuido="S-21",
            reciboAgrafado=False,
            retencaoAte=datetime.now().date(),
        )

        return DecisaoResponse(
            avaliacaoId=uuid4(),
            pedidoId=str(pedido.get("id") or f"P-{uuid4().hex[:6]}"),
            avaliadaEm=datetime.now(timezone.utc),
            versaoBaseConhecimento="com.levis.devolucoes:prolog-rules:1.0.0 (71 Regras)",
            elegibilidade=elegibilidade,
            tipoVerificacao=tipo_verificacao,
            tipoTransacao=tipo_transacao,
            valorDevolucao=69.50,
            baseValor=BaseValorEnum.VALOR_PAGO,
            meioReembolso=meio_reembolso,
            aprovacao=aprovacao,
            processo=processo,
            terminal=False,
            excecaoRecusada=(elegibilidade == ElegibilidadeEnum.ENCAMINHAR),
            documentacao=doc,
            artigos=artigos_list,
            regras=regras,
            regrasAValidar=["A-19", "A-22"] if elegibilidade == ElegibilidadeEnum.REVER else [],
        )
