"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import StatusFooter from "@/components/ui/StatusFooter";
import { WizardProvider } from "@/components/wizard/WizardContext";

export default function NovoAtendimentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WizardProvider>
      <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
        {/* Top Fixed Navbar */}
        <Navbar
          activeRoute="novo-atendimento"
          operatorName="Tiago Silva"
          operatorRole="Operador N2"
          streakCount={18}
        />

        {/* Central Content Area */}
        <main id="main-content" className="w-full flex-1 pt-20 pb-6 flex flex-col items-center">
          {children}
        </main>

        {/* Bottom Engine Health Footer */}
        <StatusFooter droolsStatus="online" prologStatus="online" />
      </div>
    </WizardProvider>
  );
}
