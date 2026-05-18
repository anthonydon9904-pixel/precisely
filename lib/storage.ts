import fs from 'fs';
import path from 'path';
import { randomUUID, createHash } from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'data', 'db.json');

export interface Question {
  id: string;
  text: string;
  type: 'yesno' | 'short';
}

export interface TimeSlot {
  id: string;
  datetime: string;
  available: boolean;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  availability: string;
  experience: string;
  questions: Question[];
  timeSlots: TimeSlot[];
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  answers: Record<string, string>;
  resumeText: string;
  score: number;
  recommendation: 'Advance' | 'Maybe' | 'Pass';
  reasoning: string;
  submittedAt: string;
}

export interface InterviewInvite {
  id: string;
  token: string;
  jobId: string;
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  round: number;
  bookedSlotId: string | null;
  sentAt: string;
}

export interface Employer {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  token: string;
  employerId: string;
  createdAt: string;
}

interface DB {
  jobs: Job[];
  applications: Application[];
  employers: Employer[];
  sessions: Session[];
  interviewInvites: InterviewInvite[];
}

function readDB(): DB {
  if (!fs.existsSync(DATA_FILE)) {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ jobs: [], applications: [], employers: [], sessions: [], interviewInvites: [] }));
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (!data.employers) data.employers = [];
  if (!data.sessions) data.sessions = [];
  if (!data.interviewInvites) data.interviewInvites = [];
  return data;
}

function writeDB(db: DB): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'precisely-salt').digest('hex');
}

// Employer auth
export function createEmployer(email: string, password: string): Employer | null {
  const db = readDB();
  if (db.employers.find(e => e.email.toLowerCase() === email.toLowerCase())) return null;
  const employer: Employer = {
    id: randomUUID(),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.employers.push(employer);
  writeDB(db);
  return employer;
}

export function loginEmployer(email: string, password: string): string | null {
  const db = readDB();
  const employer = db.employers.find(e => e.email.toLowerCase() === email.toLowerCase());
  if (!employer || employer.passwordHash !== hashPassword(password)) return null;
  const token = randomUUID();
  db.sessions.push({ token, employerId: employer.id, createdAt: new Date().toISOString() });
  writeDB(db);
  return token;
}

export function getEmployerFromToken(token: string): Employer | null {
  const db = readDB();
  const session = db.sessions.find(s => s.token === token);
  if (!session) return null;
  return db.employers.find(e => e.id === session.employerId) || null;
}

export function deleteSession(token: string): void {
  const db = readDB();
  db.sessions = db.sessions.filter(s => s.token !== token);
  writeDB(db);
}

// Jobs
export function createJob(employerId: string, title: string, description: string, location: string, availability: string, experience: string, questions: Omit<Question, 'id'>[], timeSlots: string[]): Job {
  const db = readDB();
  const job: Job = {
    id: randomUUID(),
    employerId,
    title,
    description,
    location,
    availability,
    experience,
    questions: questions.map(q => ({ ...q, id: randomUUID() })),
    timeSlots: timeSlots.map(dt => ({ id: randomUUID(), datetime: dt, available: true })),
    createdAt: new Date().toISOString(),
  };
  db.jobs.push(job);
  writeDB(db);
  return job;
}

export function getJob(id: string): Job | null {
  const db = readDB();
  return db.jobs.find(j => j.id === id) || null;
}

export function getJobsForEmployer(employerId: string): Job[] {
  const db = readDB();
  return db.jobs.filter(j => j.employerId === employerId);
}

export function getJobs(): Job[] {
  const db = readDB();
  return db.jobs;
}

// Applications
export function createApplication(data: Omit<Application, 'id' | 'submittedAt'>): Application {
  const db = readDB();
  const application: Application = {
    ...data,
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  db.applications.push(application);
  writeDB(db);
  return application;
}

export function getApplicationsForJob(jobId: string): Application[] {
  const db = readDB();
  return db.applications.filter(a => a.jobId === jobId);
}

// Interview invites
export function createInvite(jobId: string, applicationId: string, applicantName: string, applicantEmail: string, round: number): InterviewInvite {
  const db = readDB();
  const invite: InterviewInvite = {
    id: randomUUID(),
    token: randomUUID(),
    jobId,
    applicationId,
    applicantName,
    applicantEmail,
    round,
    bookedSlotId: null,
    sentAt: new Date().toISOString(),
  };
  db.interviewInvites.push(invite);
  writeDB(db);
  return invite;
}

export function getInviteByToken(token: string): InterviewInvite | null {
  const db = readDB();
  return db.interviewInvites.find(i => i.token === token) || null;
}

export function getInvitesForJob(jobId: string): InterviewInvite[] {
  const db = readDB();
  return db.interviewInvites.filter(i => i.jobId === jobId);
}

export function bookSlot(token: string, slotId: string): boolean {
  const db = readDB();
  const invite = db.interviewInvites.find(i => i.token === token);
  if (!invite || invite.bookedSlotId) return false;
  const job = db.jobs.find(j => j.id === invite.jobId);
  if (!job) return false;
  const slot = job.timeSlots.find(s => s.id === slotId && s.available);
  if (!slot) return false;
  slot.available = false;
  invite.bookedSlotId = slotId;
  writeDB(db);
  return true;
}
