"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { cn } from "cn";
import Form from "@/components/Form";

type Inputs = {
    name: string;
    email: string;
    password: string;
};

export default function RegisterPage() {
    const router = useRouter();

    const onSubmit = async ({ name, email, password }: Inputs) => {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) return error.message ?? "Invalid credentials";
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6")}>

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
                </div>
            </div>
        </div>
    );
}