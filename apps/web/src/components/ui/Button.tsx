import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        accent: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/80",
        outline:
          "border border-white/10 bg-background/50 shadow-sm hover:bg-accent hover:text-accent-foreground backdrop-blur-md",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        subtle: "bg-secondary/50 text-secondary-foreground hover:bg-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-none hover:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-2",
        xs: "h-7 rounded-md px-2.5 text-[10px]",
        sm: "h-9 rounded-lg px-4 text-xs",
        md: "h-10 rounded-xl px-5 py-2 text-sm",
        lg: "h-12 rounded-2xl px-10 text-base",
        xl: "h-14 rounded-2xl px-12 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
  target?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, href, target, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    if (href) {
      return (
        <Link 
          href={href} 
          target={target} 
          className={cn(buttonVariants({ variant, size, className }))}
        >
          {props.children}
        </Link>
      );
    }
    
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
