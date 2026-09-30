"use client";

import { atom } from "jotai";

export type User = {
  id: number;
  email: string;
  name: string | null;
  money: number;
  created_at: string;
};

export const userAtom = atom<User | null>(null);

export const authCheckedAtom = atom(false);