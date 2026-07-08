import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route creates an admin user using the service role key.
// Visit: http://localhost:3000/api/setup-admin
// DELETE THIS FILE after creating your admin user!

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set in .env.local" },
      { status: 500 }
    );
  }

  // Create admin client with service role key (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminEmail = "admin@mindbase.dev";
  const adminPassword = "password123";

  try {
    // Step 1: Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(
      (u) => u.email === adminEmail
    );

    let userId: string;

    if (existingAdmin) {
      // User exists — update their password to make sure it works
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        existingAdmin.id,
        {
          password: adminPassword,
          email_confirm: true,
        }
      );
      if (error) {
        return NextResponse.json(
          { error: `Failed to update existing user: ${error.message}` },
          { status: 500 }
        );
      }
      userId = existingAdmin.id;
    } else {
      // Create new user via Admin API
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Skip email confirmation
        user_metadata: { name: "Admin User" },
      });

      if (error) {
        return NextResponse.json(
          { error: `Failed to create user: ${error.message}` },
          { status: 500 }
        );
      }
      userId = data.user.id;
    }

    // Step 2: Ensure profile exists with admin role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          name: "Admin User",
          email: adminEmail,
          role: "admin",
          bio: "Platform administrator",
          title: "Platform Admin",
          company: "Mindbase Academy",
        },
        { onConflict: "id" }
      );

    if (profileError) {
      return NextResponse.json(
        { error: `Failed to set profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully!",
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
      note: "DELETE the file src/app/api/setup-admin/route.ts after use!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Unexpected error: ${err.message}` },
      { status: 500 }
    );
  }
}
