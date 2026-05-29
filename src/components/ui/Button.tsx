import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden bg-primary text-primary-foreground shadow-sm transition-colors hover:text-black z-0 before:absolute before:inset-0 before:-z-10 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.19,1,0.22,1)] hover:before:scale-x-100",
        destructive:
          "relative overflow-hidden bg-destructive text-destructive-foreground shadow-sm transition-colors hover:text-white z-0 before:absolute before:inset-0 before:-z-10 before:bg-red-900 before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.19,1,0.22,1)] hover:before:scale-x-100",
        outline:
          "relative overflow-hidden border border-white/10 bg-transparent shadow-sm transition-colors hover:text-black z-0 before:absolute before:inset-0 before:-z-10 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.19,1,0.22,1)] hover:before:scale-x-100",
        secondary:
          "relative overflow-hidden bg-secondary text-secondary-foreground shadow-sm transition-colors hover:text-black z-0 before:absolute before:inset-0 before:-z-10 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.19,1,0.22,1)] hover:before:scale-x-100",
        ghost: "relative overflow-hidden transition-colors hover:text-black z-0 before:absolute before:inset-0 before:-z-10 before:bg-white before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.19,1,0.22,1)] hover:before:scale-x-100",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
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

export { Button, buttonVariants }
