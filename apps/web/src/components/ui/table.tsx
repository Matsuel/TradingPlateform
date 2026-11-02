"use client"

import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "cn"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

// Ajouts du projet : `static` sans survol (ligne d'état), `plain` sans bordure ni survol (liste d'indicateurs)
const tableRowVariants = cva("transition-colors", {
  variants: {
    variant: {
      default: "border-b hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
      static: "border-b",
      plain: "",
    },
  },
  defaultVariants: { variant: "default" },
})

function TableRow({ className, variant, ...props }: React.ComponentProps<"tr"> & VariantProps<typeof tableRowVariants>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ variant }), className)}
      {...props}
    />
  )
}

// Ajouts du projet : `caption` en-tête discret (petit, atténué), `row` libellé de ligne d'une liste d'indicateurs
const tableHeadVariants = cva("px-2 text-left align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0", {
  variants: {
    variant: {
      default: "h-10 font-medium text-foreground",
      caption: "text-small font-medium text-muted-foreground",
      row: "font-normal whitespace-normal",
    },
  },
  defaultVariants: { variant: "default" },
})

function TableHead({ className, variant, ...props }: React.ComponentProps<"th"> & VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants({ variant }), className)}
      {...props}
    />
  )
}

// Ajouts du projet : `strong` valeur mise en avant, `muted` valeur en retrait (colonnes d'une liste d'indicateurs)
const tableCellVariants = cva("p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0", {
  variants: {
    variant: {
      default: "",
      strong: "font-semibold",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
})

function TableCell({ className, variant, ...props }: React.ComponentProps<"td"> & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ variant }), className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
