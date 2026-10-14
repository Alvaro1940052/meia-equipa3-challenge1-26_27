import type { PrologMode } from "./PrologModeSwitch";
import PrologInference from "./PrologInference";
import PrologQuickEval from "./PrologQuickEval";

export default function PrologPanel({ mode }: { mode: PrologMode }) {
  return mode === "evaluate" ? <PrologQuickEval /> : <PrologInference />;
}
