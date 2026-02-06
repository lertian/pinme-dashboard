import React from "react";
import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    loading,
    disabled,
    className,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} ${loading ? "loading" : ""} ${className || ""}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <span className="spinner"></span> : children}
        </button>
    );
};

export default Button;
