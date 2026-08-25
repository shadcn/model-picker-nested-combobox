"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Model = {
  id: string
  name: string
  provider: string
  contextWindow: number
}

const DEFAULT_MODEL_IDS = [
  "openai/gpt-5-mini",
  "openai/gpt-5-pro",
  "openai/gpt-5.5",
  "openai/gpt-5.5-fast",
  "openai/gpt-5.6-sol-fast",
]

const DEFAULT_SELECTED_ID = "openai/gpt-5.6-sol-fast"

function formatContext(contextWindow: number) {
  if (contextWindow >= 1_000_000) {
    return `${Math.round(contextWindow / 1_000_000)}M`
  }
  return `${Math.round(contextWindow / 1_000)}K`
}

function ModelPickerPanel({
  title,
  open,
  onOpenChange,
  trigger,
  nativeButton = true,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  children,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactElement
  nativeButton?: boolean
  className?: string
  children: React.ReactNode
} & Pick<
  React.ComponentProps<typeof PopoverContent>,
  "align" | "alignOffset" | "side" | "sideOffset"
>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger nativeButton={nativeButton} render={trigger} />
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger nativeButton={nativeButton} render={trigger} />
      <PopoverContent
        className={cn("p-0", className)}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export function ModelPicker({ models }: { models: Model[] }) {
  const modelsById = React.useMemo(
    () => new Map(models.map((model) => [model.id, model])),
    [models]
  )

  const [open, setOpen] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [pinnedIds, setPinnedIds] = React.useState<string[]>(() =>
    DEFAULT_MODEL_IDS.filter((id) => modelsById.has(id))
  )
  const [selectedId, setSelectedId] = React.useState<string | undefined>(() =>
    modelsById.has(DEFAULT_SELECTED_ID) ? DEFAULT_SELECTED_ID : models[0]?.id
  )

  const selectedModel = selectedId ? modelsById.get(selectedId) : undefined
  const pinnedModels = pinnedIds
    .map((id) => modelsById.get(id))
    .filter((model): model is Model => Boolean(model))

  function selectModel(id: string) {
    setSelectedId(id)
    setAddOpen(false)
    setOpen(false)
  }

  function addModel(id: string) {
    setPinnedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
    selectModel(id)
  }

  return (
    <ModelPickerPanel
      title="Select a model"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setAddOpen(false)
        }
      }}
      align="start"
      className="w-60"
      trigger={
        <Button variant="outline">
          {selectedModel ? selectedModel.name : "Select model"}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      }
    >
      <Command>
        <CommandInput placeholder="Search models" />
        <CommandList>
          <CommandEmpty>No models found.</CommandEmpty>
          <CommandGroup>
            {pinnedModels.map((model) => (
              <CommandItem
                key={model.id}
                value={model.id}
                keywords={[model.name, model.provider]}
                data-checked={model.id === selectedId}
                onSelect={() => selectModel(model.id)}
              >
                {model.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator alwaysRender />
          <CommandGroup forceMount>
            <ModelPickerPanel
              title="Add models"
              open={addOpen}
              onOpenChange={setAddOpen}
              nativeButton={false}
              side="right"
              align="start"
              sideOffset={8}
              alignOffset={-4}
              className="w-80"
              trigger={
                <CommandItem
                  value="add-models"
                  forceMount
                  onSelect={() => setAddOpen(true)}
                >
                  <PlusIcon />
                  Add models
                </CommandItem>
              }
            >
              <Command>
                <CommandInput placeholder="Search all models" />
                <CommandList>
                  <CommandEmpty>No models found.</CommandEmpty>
                  <CommandGroup>
                    {models.map((model) => (
                      <CommandItem
                        key={model.id}
                        value={model.id}
                        keywords={[model.name, model.provider]}
                        data-checked={model.id === selectedId}
                        onSelect={() => addModel(model.id)}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{model.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {model.provider} ·{" "}
                            {formatContext(model.contextWindow)} context
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </ModelPickerPanel>
          </CommandGroup>
        </CommandList>
      </Command>
    </ModelPickerPanel>
  )
}
