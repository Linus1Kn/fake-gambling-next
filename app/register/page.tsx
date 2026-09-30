"use client";

import Form from "../components/form";
import Input from "../components/input";
import Button from "../components/button";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/lib/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Registration failed");
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
    <Form title="Register" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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
        minLength={8}
        required
      />

      {error && <p>{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </Button>
    </Form>
  );
}