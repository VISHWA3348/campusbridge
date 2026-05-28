import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- RUNNING ANALYTICS DEBUG ---');
  
  const queries = [
    { name: 'user.groupBy', fn: () => prisma.user.groupBy({ by: ['role'], _count: { id: true } }) },
    { name: 'college.count', fn: () => prisma.college.count() },
    { name: 'job.count', fn: () => prisma.job.count() },
    { name: 'webinar.count', fn: () => prisma.webinar.count() },
    { name: 'job.groupBy', fn: () => prisma.job.groupBy({ by: ['company'], _count: { company: true } }) },
    { name: 'resumeAnalysis.aggregate', fn: () => prisma.resumeAnalysis.aggregate({ _count: { id: true }, _avg: { score: true } }) },
    { name: 'mentorshipRequest.aggregate', fn: () => prisma.mentorshipRequest.aggregate({ _count: { id: true }, _avg: { rating: true } }) },
    { name: 'placement.count', fn: () => prisma.placement.count() },
    { name: 'message.count', fn: () => prisma.message.count() },
    { name: 'registration.count', fn: () => prisma.registration.count() },
    { name: 'student.findMany', fn: () => prisma.student.findMany({ select: { readinessScore: true, _count: { select: { resumeAnalyses: true, registrations: true, mentorshipRequests: true, referrals: true } } } }) },
    { name: 'college.findMany (top)', fn: () => prisma.college.findMany({ include: { _count: { select: { users: true, jobs: true } }, users: { where: { role: 'STUDENT' }, select: { student: { select: { readinessScore: true } } } } }, take: 5 }) },
    { name: 'alumni.aggregate', fn: () => prisma.alumni.aggregate({ _sum: { mentorshipXP: true, mentorshipImpactScore: true } }) },
    { name: 'user.findMany (recent)', fn: () => prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { college: true } }) },
    { name: 'webinar.findMany (recent)', fn: () => prisma.webinar.findMany({ take: 3, orderBy: { createdAt: 'desc' } }) },
    { name: 'referral.findMany (recent)', fn: () => prisma.referral.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { student: { include: { user: true } }, alumni: { include: { user: true } } } }) },
    { name: 'resumeAnalysis.findMany (recent)', fn: () => prisma.resumeAnalysis.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { student: { include: { user: true } } } }) },
    { name: 'mentorshipRequest.findMany (recent)', fn: () => prisma.mentorshipRequest.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { student: { include: { user: true } }, alumni: { include: { user: true } } } }) },
    { name: 'job.findMany (recent)', fn: () => prisma.job.findMany({ take: 3, orderBy: { createdAt: 'desc' } }) },
    { name: 'user.findMany (monthly)', fn: () => prisma.user.findMany({ select: { createdAt: true } }) }
  ];

  for (const q of queries) {
    try {
      const res = await q.fn();
      console.log(`✓ ${q.name} SUCCESS`, Array.isArray(res) ? `[Length: ${res.length}]` : typeof res === 'object' ? JSON.stringify(res) : res);
    } catch (e) {
      console.error(`✗ ${q.name} FAILED:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

