import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "broughsef@gmail.com";
const FROM_EMAIL = "Mission Control <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  try {
    const { content, date } = await req.json();
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });
    if (!RESEND_API_KEY) return NextResponse.json({ error: "Email service not configured" }, { status: 500 });

    const htmlContent = `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:8px"><div style="border-bottom:2px solid #f59e0b;padding-bottom:12px;margin-bottom:24px"><h1 style="color:#f59e0b;font-size:20px;margin:0;text-transform:uppercase">⚡ Mission Control</h1><p style="color:#94a3b8;font-size:13px;margin:4px 0 0">${date}</p></div><pre style="white-space:pre-wrap;font-size:14px;line-height:1.7;color:#e2e8f0;margin:0">${(content||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre></div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject: `Mission Control Brief — ${date}`, text: content, html: htmlContent }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Failed to send email", details: data }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("send-brief error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
