import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-[0.45] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:-translate-y-px hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default: "border-[var(--button-border)] bg-primary text-primary-foreground shadow-sm",
        primary: "border-[var(--button-border)] bg-primary text-primary-foreground shadow-sm",
        secondary: "border-[var(--button-border)] bg-secondary text-secondary-foreground shadow-sm",
        destructive:
          "border-[var(--button-border)] bg-destructive text-destructive-foreground shadow-sm",
        success:
          "border-[var(--button-border)] bg-emerald-600 text-white shadow-sm disabled:opacity-100",
        outline:
          "border-[var(--button-border)] bg-transparent text-foreground shadow-sm active:shadow-none",
        tertiary: "border-transparent bg-transparent text-muted-foreground shadow-none",
        ghost: "border-transparent bg-transparent shadow-none",
        link: "h-auto border-transparent bg-transparent p-0 text-primary underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "h-11 rounded-lg px-4 py-2 text-sm",
        compact: "h-8 rounded-md px-3 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        hero: "h-14 rounded-lg px-8 text-base",
        icon: "h-11 w-11 rounded-lg p-0",
        "icon-compact": "h-8 w-8 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export { Button, buttonVariants }
