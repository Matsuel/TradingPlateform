import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
