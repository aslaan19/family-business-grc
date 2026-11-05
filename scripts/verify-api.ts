import "dotenv/config";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../app/lib/prisma";
import { POST as submitFirst } from "../app/api/submissions/route";
import { POST as submitSecond } from "../app/api/submissions2/route";
import {
  GET as proposalStatus,
  POST as requestProposal,
} from "../app/api/proposal/route";
import { SECTIONS } from "../app/lib/institutional-content";
import { proxy } from "../proxy";
import { POST as publishProposal } from "../app/api/admin/proposal/route";
import { validProposal, proposalTotals } from "../app/lib/proposal-data";

// Replace database methods before calling handlers: no database I/O is performed.
const userId = "00000000-0000-4000-8000-000000000001";
const questions = [{ id: "q1" }, { id: "q2" }];
const request = (url: string, body: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
async function main() {
  let created: Record<string, unknown> = {};
  let writtenAnswers: Record<string, unknown>[] = [];
  prisma.assessmentQuestion.findMany = async () => questions;
  prisma.assessmentSubmission.findFirst = async () => null;
  prisma.$transaction = async (fn: (tx: unknown) => unknown) =>
    fn({
      assessmentSubmission: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          created = data;
          return { id: "submission1", ...data };
        },
      },
      assessmentAnswer: {
        createMany: async ({ data }: { data: Record<string, unknown>[] }) => {
          writtenAnswers = data;
        },
      },
    });
  assert.equal(
    (await submitFirst(request("/api/submissions", { userId, answers: [] })))
      .status,
    400,
  );
  assert.equal(
    (
      await submitFirst(
        request("/api/submissions", {
          userId,
          answers: [
            { questionId: "q1", selectedValue: 10 },
            { questionId: "q1", selectedValue: 10 },
          ],
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await submitFirst(
        request("/api/submissions", {
          userId,
          answers: [
            { questionId: "q1", selectedValue: 500 },
            { questionId: "q2", selectedValue: 0 },
          ],
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await submitFirst(
        request("/api/submissions", {
          userId,
          totalScore: 9999,
          maxScore: 1,
          answers: [
            { questionId: "q1", selectedValue: 5, selectedLabel: "yes" },
            { questionId: "q2", selectedValue: 0 },
          ],
        }),
      )
    ).status,
    201,
  );
  assert.equal(created.totalScore, 5);
  assert.equal(created.maxScore, 20);
  assert.equal(writtenAnswers[0].selectedLabel, "partial");
  prisma.assessmentSubmission.findFirst = async () => ({ id: "existing" });
  assert.equal(
    (
      await submitFirst(
        request("/api/submissions", {
          userId,
          answers: [
            { questionId: "q1", selectedValue: 5 },
            { questionId: "q2", selectedValue: 0 },
          ],
        }),
      )
    ).status,
    409,
  );

  const data: Record<string, unknown> = {};
  for (const s of SECTIONS)
    for (const f of s.fields.filter((f) => f.required))
      data[f.key] =
        f.type === "table"
          ? [
              Object.fromEntries(
                (f.columns ?? []).map((c) => [
                  c.keyEn,
                  c.options?.[0] || "Test",
                ]),
              ),
            ]
          : f.type === "number"
            ? f.key === "yearEstablished"
              ? "2005"
              : "0"
            : f.type === "yesno"
              ? "No"
              : f.options?.[0] || "Test business";
  prisma.user.findUnique = async () => ({ id: userId });
  prisma.assessmentSubmission.findFirst = async () => null;
  assert.equal(
    (await submitSecond(request("/api/submissions2", { userId, formData: {} })))
      .status,
    400,
  );
  assert.equal(
    (
      await submitSecond(
        request("/api/submissions2", { userId, formData: data }),
      )
    ).status,
    403,
  );
  prisma.assessmentSubmission.findFirst = async ({
    where,
  }: {
    where: { submissionType: string };
  }) => (where.submissionType === "assessment1" ? { id: "first" } : null);
  prisma.assessmentSubmission.create = async ({
    data: incoming,
  }: {
    data: Record<string, unknown>;
  }) => {
    created = incoming;
    return { id: "second", ...incoming };
  };
  assert.equal(
    (
      await submitSecond(
        request("/api/submissions2", {
          userId,
          formData: { ...data, _proposalRequestedAt: "forged" },
        }),
      )
    ).status,
    201,
  );
  assert.ok(
    !Object.hasOwn(created.rawPayload as object, "_proposalRequestedAt"),
  );

  let payload: Record<string, unknown> = {
    legalName: "Preserve this business",
  };
  prisma.assessmentSubmission.findMany = async () => [
    { id: "second", submissionType: "assessment2", rawPayload: payload },
  ];
  assert.equal(
    (await requestProposal(request("/api/proposal", { userId }))).status,
    403,
  );
  prisma.assessmentSubmission.findMany = async () => [
    { id: "first", submissionType: "assessment1" },
    { id: "second", submissionType: "assessment2", rawPayload: payload },
  ];
  let updates = 0;
  prisma.assessmentSubmission.update = async ({
    data: incoming,
  }: {
    data: { rawPayload: Record<string, unknown> };
  }) => {
    updates++;
    payload = incoming.rawPayload;
  };
  assert.equal(
    (await requestProposal(request("/api/proposal", { userId }))).status,
    201,
  );
  const firstRequestAt = payload._proposalRequestedAt;
  assert.equal(
    (await requestProposal(request("/api/proposal", { userId }))).status,
    200,
  );
  assert.equal(updates, 1);
  assert.equal(payload._proposalRequestedAt, firstRequestAt);
  assert.equal(payload.legalName, "Preserve this business");
  const status = await proposalStatus(
    new NextRequest(`http://localhost/api/proposal?userId=${userId}`),
  );
  assert.equal((await status.json()).requestedAt, firstRequestAt);
  const commercial = {
    title: "Advisory engagement",
    scope: "Governance roadmap and implementation support",
    items: [{ description: "Advisory services", quantity: 2, unitPrice: 6000 }],
    taxRate: 15,
    validUntil: "2099-12-31",
  };
  assert.equal(validProposal({ ...commercial, items: [null] }), false);
  assert.equal(
    validProposal({
      ...commercial,
      items: [{ description: "Service", quantity: -1, unitPrice: 100 }],
    }),
    false,
  );
  assert.deepEqual(
    proposalTotals(commercial as Parameters<typeof proposalTotals>[0]),
    { subtotal: 12000, tax: 1800, total: 13800 },
  );
  assert.equal(
    (
      await publishProposal(
        request("/api/admin/proposal", {
          userId,
          proposal: { ...commercial, taxRate: -1 },
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await publishProposal(
        request("/api/admin/proposal", { userId, proposal: commercial }),
      )
    ).status,
    200,
  );
  assert.equal(
    (payload._financialProposal as { title: string }).title,
    commercial.title,
  );
  assert.equal(payload._proposalRequestedAt, firstRequestAt);
  assert.equal(payload.legalName, "Preserve this business");
  const publishedStatus = await proposalStatus(
    new NextRequest(`http://localhost/api/proposal?userId=${userId}`),
  );
  assert.equal((await publishedStatus.json()).proposal.title, commercial.title);
  for (const url of [
    "/admin",
    "/api/admin/stats",
    "/api/admin/report-pdf",
    "/api/admin/proposal",
    "/api/export",
  ])
    assert.equal(proxy(new NextRequest(`http://localhost${url}`)).status, 401);
  assert.equal(
    proxy(new NextRequest("http://localhost/assessment")).status,
    200,
  );
  console.log(
    "PASS: server completeness, score integrity, duplicate handling, assessment ordering, proposal gating/idempotency, payload preservation, and admin API protection.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
