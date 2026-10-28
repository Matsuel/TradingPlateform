"use client";

import { useRouter } from "next/navigation";
import Form from "@/components/OldForm";
import { authClient } from "@/lib/auth";
import { prefix } from "@/lib/path";

type Inputs = {
    name: string;
    email: string;
    password: string;
};

export function RegisterForm() {
    const router = useRouter();

    const onSubmit = async ({ name, email, password }: Inputs) => {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) return error.message ?? "Invalid credentials";
        router.push(prefix);
        router.refresh();
    }

    return (
        <Form<Inputs>
            title="Register a new account"
            description="Enter your details below to create an account"
            inputs={[
                { name: "name", label: "Name", type: "text" },
                { name: "email", label: "Email", type: "email"},
                { name: "password", label: "Password", type: "password" },
            ]}
            submitText="Register"
            submittingText="Creating account..."
            onSubmit={onSubmit}
        />
    );
}
