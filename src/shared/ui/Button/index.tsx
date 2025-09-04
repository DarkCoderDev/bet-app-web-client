import type {ReactNode} from "react";
import clsx from 'clsx';

type ButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    className?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
};

export const Button = ({
                           children,
                           onClick,
                           variant = "primary",
                           size = "md",
                           iconLeft,
                           iconRight,
                           className,
                           type = "button",
                           disabled = false,
                           ...otherProps
                       }: ButtonProps) => {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white",
    };

    const sizes: Record<string, string> = {
        sm: "px-2 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...otherProps}
        >
            {iconLeft && <span className="mr-2">{iconLeft}</span>}
            {children}
            {iconRight && <span className="ml-2">{iconRight}</span>}
        </button>
    );
};
