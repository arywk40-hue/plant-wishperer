"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Info } from "lucide-react"

export default function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content side="top" align="center" className="bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg z-50">
          {content}
          <TooltipPrimitive.Arrow className="fill-current text-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
