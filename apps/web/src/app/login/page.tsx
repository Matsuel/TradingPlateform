"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { cn } from "cn";
import Form from "@/components/Form";

type Inputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const router = useRouter();

    const onSubmit = async ({ email, password }: Inputs) => {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) return error.message ?? "Invalid credentials";
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6")}>

                    <Form<Inputs>
                        title="Login to your account"
                        description="Enter your email below to login to your account"
                        inputs={[
                            { name: "email", label: "Email", type: "email"},
                            { name: "password", label: "Password", type: "password" },
                        ]}
                        submitText="Login"
                        submittingText="Logging in..."
                        onSubmit={onSubmit}
                    />
                </div>
            </div>
        </div>
    );
}