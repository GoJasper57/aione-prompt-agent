"use client"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Wand2, SlidersHorizontal } from "lucide-react"

interface SteeringValues {
  cinematic: number
  detail: number
  realistic: number
  experimental: number
}

interface SteeringControlsProps {
  values: SteeringValues
  onChange: (values: SteeringValues) => void
  onRefine: () => void
  disabled: boolean
}

interface SteeringSliderProps {
  label: string
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (value: number) => void
}

function SteeringSlider({ label, leftLabel, rightLabel, value, onChange }: SteeringSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/50">{Math.round(value * 100)}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground w-16 text-right">{leftLabel}</span>
        <Slider
          value={[value * 100]}
          onValueChange={([v]) => onChange(v / 100)}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-[10px] text-muted-foreground w-16">{rightLabel}</span>
      </div>
    </div>
  )
}

export function SteeringControls({ 
  values, 
  onChange, 
  onRefine, 
  disabled 
}: SteeringControlsProps) {
  const handleChange = (key: keyof SteeringValues) => (value: number) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground/80">Steering Controls</h3>
      </div>
      
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5 space-y-5">
        <SteeringSlider
          label="Cinematic Feel"
          leftLabel="Subtle"
          rightLabel="Cinematic"
          value={values.cinematic}
          onChange={handleChange("cinematic")}
        />
        
        <SteeringSlider
          label="Detail Level"
          leftLabel="Concise"
          rightLabel="Detailed"
          value={values.detail}
          onChange={handleChange("detail")}
        />
        
        <SteeringSlider
          label="Style"
          leftLabel="Realistic"
          rightLabel="Stylized"
          value={values.realistic}
          onChange={handleChange("realistic")}
        />
        
        <SteeringSlider
          label="Safety"
          leftLabel="Safe"
          rightLabel="Experimental"
          value={values.experimental}
          onChange={handleChange("experimental")}
        />

        <Button
          onClick={onRefine}
          disabled={disabled}
          className={cn(
            "w-full h-10 rounded-xl font-medium mt-2",
            "bg-secondary text-secondary-foreground",
            "hover:bg-secondary/80 transition-all duration-200",
            "disabled:opacity-50"
          )}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Refine Prompt
        </Button>
      </div>
    </div>
  )
}
