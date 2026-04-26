import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state"); // We pass user ID as state

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/profile?error=missing_code", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResp.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/profile?error=token_failed", request.url));
    }

    // Get GitHub user info
    const userResp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = await userResp.json();

    // Save to Supabase profiles using service role (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Update profile with GitHub info
    // Note: We use the anon key here but RLS allows users to update own profile
    // The actual update needs to happen client-side or with service role
    // For now, store in URL params and let client update
    const redirectUrl = new URL("/profile", request.url);
    redirectUrl.searchParams.set("github_username", githubUser.login);
    redirectUrl.searchParams.set("github_token", tokenData.access_token);
    redirectUrl.searchParams.set("github_connected", "true");

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return NextResponse.redirect(new URL("/profile?error=oauth_failed", request.url));
  }
}
