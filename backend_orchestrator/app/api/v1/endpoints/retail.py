"""FastAPI endpoints exposing the Levi's Retail Returns Prolog expert engine.

Provides HTTP routes for batch evaluation, dialogic interactive interrogation,
counterfactual What-If simulation, and multi-perspective explanations (How, Why Not).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status

from app.api.deps import get_prolog_client
from app.clients.prolog_client import PrologClient
from app.core.exceptions import (
    PrologConnectionError,
    PrologResponseError,
    PrologTimeoutError,
)
from app.schemas.common import EvaluationResponse

router = APIRouter(
    prefix="/retail",
    tags=["Levi's Retail Returns Expert Engine (Prolog)"],
)


def _handle_prolog_exception(exc: Exception) -> None:
    """Translate Prolog transport/runtime exceptions into standard FastAPI HTTPExceptions."""
    if isinstance(exc, (PrologConnectionError, PrologTimeoutError)):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=exc.message,
        ) from exc
    if isinstance(exc, PrologResponseError):
        raise HTTPException(
            status_code=exc.status_code if 400 <= exc.status_code < 500 else status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        ) from exc
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(exc),
    ) from exc


@router.post(
    "/evaluate",
    status_code=status.HTTP_200_OK,
    summary="Evaluate retail return scenario against Levi's Prolog rules",
    description=(
        "Executes batch deduction across the 71 Levi's retail return rules and 9 policy families. "
        "Returns the final diagnostic verdict and justification chain."
    ),
)
async def evaluate_retail_scenario(
    payload: Dict[str, Any] = Body(...),
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Execute batch evaluation on retail facts."""
    try:
        return await prolog_client.evaluate_retail(payload)
    except Exception as exc:
        _handle_prolog_exception(exc)


@router.post(
    "/interactive",
    status_code=status.HTTP_200_OK,
    summary="Step-by-step or simulated active dialogue interrogation",
    description=(
        "Coordinates interactive premise acquisition per Prof. ACM mechanics. "
        "Allows answering pending floor questions or evaluating with partial facts."
    ),
)
async def interactive_dialogue(
    payload: Dict[str, Any] = Body(default_factory=dict),
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Execute dialogic step with the retail engine."""
    try:
        return await prolog_client.interactive_retail(payload)
    except Exception as exc:
        _handle_prolog_exception(exc)


@router.post(
    "/whatif",
    status_code=status.HTTP_200_OK,
    summary="Counterfactual simulation sandbox (What-If)",
    description=(
        "Hypothetically modifies premises and compares baseline outcome against simulated "
        "outcome without persisting changes or polluting session working memory."
    ),
)
async def whatif_simulation(
    payload: Dict[str, Any] = Body(...),
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Execute counterfactual What-If sandbox simulation."""
    try:
        return await prolog_client.whatif_retail(payload)
    except Exception as exc:
        _handle_prolog_exception(exc)


@router.post(
    "/how",
    status_code=status.HTTP_200_OK,
    summary="Causal deductive trace for fact/decision (Via 1: How)",
    description="Explains how a fact or decision was concluded step-by-step.",
)
async def explain_how(
    payload: Dict[str, Any] = Body(...),
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Generate deductive explanation for a fact."""
    try:
        return await prolog_client.how_retail(payload)
    except Exception as exc:
        _handle_prolog_exception(exc)


@router.post(
    "/whynot",
    status_code=status.HTTP_200_OK,
    summary="Failure tree analysis for unreached outcome (Via 4: Why Not)",
    description="Explains which candidate rule premises failed preventing a given outcome.",
)
async def explain_whynot(
    payload: Dict[str, Any] = Body(...),
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Generate Why Not explanation detailing failed premises."""
    try:
        return await prolog_client.whynot_retail(payload)
    except Exception as exc:
        _handle_prolog_exception(exc)


@router.get(
    "/facts",
    status_code=status.HTTP_200_OK,
    summary="List all facts currently in retail working memory",
)
async def get_retail_facts(
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Retrieve all asserted facts."""
    try:
        return await prolog_client.facts_retail()
    except Exception as exc:
        _handle_prolog_exception(exc)


@router.post(
    "/reset",
    status_code=status.HTTP_200_OK,
    summary="Reset retail engine session memory and interactive state",
)
async def reset_retail_session(
    prolog_client: PrologClient = Depends(get_prolog_client),
) -> Dict[str, Any]:
    """Reset session state."""
    try:
        return await prolog_client.reset_retail()
    except Exception as exc:
        _handle_prolog_exception(exc)
