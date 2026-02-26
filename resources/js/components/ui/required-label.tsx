import * as React from "react";
import { Label } from "@radix-ui/react-label";

function RequiredLabel({ children, className, ...props }: React.ComponentProps<"label">) {
    return (
        <Label className={className} {...props}>
            {children}
            <span className="text-red-500">*</span>
        </Label>
    );
}

export { RequiredLabel };
