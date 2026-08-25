import { ModelPicker, type Model } from "@/components/model-picker"

type GatewayModel = {
  id: string
  name: string
  owned_by: string
  context_window?: number
  type?: string
}

async function getModels(): Promise<Model[]> {
  const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status}`)
  }

  const { data } = (await res.json()) as { data: GatewayModel[] }

  return data
    .filter(
      (model) => model.type === "language" && (model.context_window ?? 0) > 0
    )
    .map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.owned_by,
      contextWindow: model.context_window ?? 0,
    }))
    .sort(
      (a, b) =>
        a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name)
    )
}

export default async function Page() {
  const models = await getModels()

  return (
    <div className="flex min-h-svh flex-col items-center gap-4 p-12">
      <ModelPicker models={models} />
    </div>
  )
}
