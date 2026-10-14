import { gatewayFetch } from "@/server/gateway";

// O `evaluate` vive fora do prefixo de inferência do gateway, por isso tem rota própria.
export async function POST(request: Request) {
  return gatewayFetch("/api/v1/evaluate", {
    method: "POST",
    body: (await request.text()) || undefined,
  });
}
