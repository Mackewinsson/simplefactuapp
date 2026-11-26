import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ActivationRequestKind" AS ENUM ('AUTONOMO', 'INTEGRATOR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "activation_requests" ADD COLUMN IF NOT EXISTS "kind" "ActivationRequestKind" NOT NULL DEFAULT 'INTEGRATOR';
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "activation_requests_kind_idx" ON "activation_requests"("kind");
    `);

    let dbHost = "unknown";
    try {
      const rawUrl = process.env.DATABASE_URL || "";
      const parsed = new URL(rawUrl);
      dbHost = parsed.host;
    } catch {
      // ignore
    }

    return NextResponse.json({
      ok: true,
      message: "Migration applied successfully",
      dbHost,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
