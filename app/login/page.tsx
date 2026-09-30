"use client";

import Form from "../components/form";
import Input from "../components/input";
import Button from "../components/button";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/lib/auth-store";

export default function LoginForm() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    // Get the newly authenticated user
    const meResponse = await fetch("/api/auth/me");

    if (meResponse.ok) {
      const meData = await meResponse.json();
      setUser(meData.user);
    }

    router.push("/");
  }

  return (
    <Form title="Login" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p>{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </Form>
  );
}