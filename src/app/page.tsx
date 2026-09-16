import React from "react";
import { auth } from "@/auth";
import { HomeClient } from "@/components/home/home-client";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const username = session?.user?.username || "demo";

  return <HomeClient isLoggedIn={isLoggedIn} username={username} />;
}
