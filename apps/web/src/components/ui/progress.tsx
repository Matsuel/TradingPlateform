"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Ajouts du projet : épaisseur de la piste (`size`) et couleur de la barre (`variant`, `running` = calcul en cours)
const progressTrackVariants = cva("", {
  variants: {
    size: {
      default: "h-1",
      md: "h-1.5",
    },
  },
  defaultVariants: { size: "default" },
})

const progressIndicatorVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      running: "bg-success animate-pulse",
    },
  },
  defaultVariants: { variant: "default" },
})

function Progress({
  className,
  children,
  value,
  size,
  variant,
  ...props
}: ProgressPrimitive.Root.Props &
  VariantProps<typeof progressTrackVariants> &
  VariantProps<typeof progressIndicatorVariants>) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack className={progressTrackVariants({ size })}>
        <ProgressIndicator className={progressIndicatorVariants({ variant })} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full transition-all", className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
