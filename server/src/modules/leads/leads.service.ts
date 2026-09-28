import { db } from '../../db/store.js';
import { Lead, Suppression } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface CSVRow {
  [key: string]: string;
}

export interface ColumnMapping {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  phone?: string;
  website?: string;
  industry?: string;
  employeeCount?: string;
}

export class LeadsService {
  // Transparent ICP Scoring Engine (0 - 100)
  static calculateLeadScore(lead: Partial<Lead>): {
    score: number;
    breakdown: Lead['scoreBreakdown'];
  } {
    let icpFit = 10;
    let titleSeniority = 10;
    let companyScale = 10;
    let completeness = 5;

    const title = (lead.title || '').toLowerCase();
    const industry = (lead.industry || '').toLowerCase();
    const employees = Number(lead.employeeCount) || 50;

    // 1. Title Seniority (up to 25 pts)
    if (/c[a-z]o|vp|vice president|chief|head of|founder|co-founder|owner/i.test(title)) {
      titleSeniority = 25;
    } else if (/director|manager|lead|principal/i.test(title)) {
      titleSeniority = 18;
    } else if (/representative|specialist|coordinator|analyst/i.test(title)) {
      titleSeniority = 12;
    }

    // 2. ICP Industry Fit (up to 35 pts)
    if (/software|saas|cloud|tech|cyber|data|ai|artificial|fintech/i.test(industry)) {
      icpFit = 35;
    } else if (/agency|consulting|marketing|services|it /i.test(industry)) {
      icpFit = 28;
    } else if (/ecommerce|retail|manufacturing|logistics/i.test(industry)) {
      icpFit = 18;
    } else {
      icpFit = 15;
    }

    // 3. Company Scale (up to 20 pts)
    if (employees >= 20 && employees <= 500) {
      companyScale = 20; // Sweet spot for SMB/Mid-market sales tools
    } else if (employees > 500 && employees <= 2000) {
      companyScale = 18;
    } else if (employees > 2000) {
      companyScale = 14;
    } else {
      companyScale = 12;
    }

    // 4. Data Completeness (up to 20 pts)
    if (lead.phone) completeness += 5;
    if (lead.website) completeness += 5;
    if (lead.industry) completeness += 5;
    if (lead.firstName && lead.lastName) completeness += 5;

    const total = Math.min(100, icpFit + titleSeniority + companyScale + completeness);

    return {
      score: total,
      breakdown: {
        icpFit,
        titleSeniority,
        companyScale,
        completeness,
      },
    };
  }

  // Parse raw CSV text into structured rows
  static parseCSV(csvText: string): CSVRow[] {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV split respecting quotes
      const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  // Auto-detect column headers intelligently
  static detectColumnMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      title: '',
      phone: '',
      website: '',
      industry: '',
      employeeCount: '',
    };

    headers.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!mapping.email && (lower.includes('email') || lower === 'mail')) mapping.email = h;
      if (!mapping.firstName && (lower.includes('firstname') || lower === 'first' || lower === 'fname')) mapping.firstName = h;
      if (!mapping.lastName && (lower.includes('lastname') || lower === 'last' || lower === 'lname')) mapping.lastName = h;
      if (!mapping.company && (lower.includes('company') || lower.includes('organization') || lower.includes('org') || lower.includes('account'))) mapping.company = h;
      if (!mapping.title && (lower.includes('title') || lower.includes('job') || lower.includes('position') || lower.includes('role'))) mapping.title = h;
      if (!mapping.phone && (lower.includes('phone') || lower.includes('mobile') || lower.includes('telephone'))) mapping.phone = h;
      if (!mapping.website && (lower.includes('website') || lower.includes('domain') || lower.includes('url'))) mapping.website = h;
      if (!mapping.industry && (lower.includes('industry') || lower.includes('sector') || lower.includes('vertical'))) mapping.industry = h;
      if (!mapping.employeeCount && (lower.includes('employee') || lower.includes('size') || lower.includes('headcount'))) mapping.employeeCount = h;
    });

    return mapping;
  }

  // Ingest & Validate CSV rows into Leads
  static processImport(
    rows: CSVRow[],
    mapping: ColumnMapping,
    tags: string[] = ['CSV Import']
  ): {
    imported: Lead[];
    duplicates: number;
    suppressed: number;
    invalidEmails: number;
  } {
    const imported: Lead[] = [];
    let duplicates = 0;
    let suppressed = 0;
    let invalidEmails = 0;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const row of rows) {
      const email = (row[mapping.email] || '').trim();

      // Check email format
      if (!email || !emailRegex.test(email)) {
        invalidEmails++;
        continue;
      }

      // Check suppression list
      if (db.isSuppressed(email)) {
        suppressed++;
        continue;
      }

      // Check duplicate
      if (db.getLeadByEmail(email)) {
        duplicates++;
        continue;
      }

      const firstName = row[mapping.firstName] || '';
      const lastName = row[mapping.lastName] || '';
      const company = row[mapping.company] || (email.split('@')[1] ? email.split('@')[1].split('.')[0] : 'Unknown');
      const title = row[mapping.title] || 'Decision Maker';
      const phone = mapping.phone ? row[mapping.phone] : undefined;
      const website = mapping.website ? row[mapping.website] : undefined;
      const industry = mapping.industry ? row[mapping.industry] : 'Technology';
      const employeeCount = mapping.employeeCount ? Number(row[mapping.employeeCount]) || 50 : 50;

      const { score, breakdown } = this.calculateLeadScore({
        title,
        industry,
        employeeCount,
        phone,
        website,
        firstName,
        lastName,
      });

      const newLead: Lead = {
        id: `lead-${uuidv4().slice(0, 8)}`,
        firstName,
        lastName,
        email,
        phone,
        company,
        title,
        website,
        industry,
        employeeCount,
        score,
        scoreBreakdown: breakdown,
        status: 'NEW',
        tags,
        verifiedEmail: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      imported.push(newLead);
    }

    if (imported.length > 0) {
      db.addLeads(imported);
      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'LEADS_IMPORTED',
        entityType: 'Lead',
        entityId: 'batch',
        description: `Imported ${imported.length} leads (Skipped: ${duplicates} duplicates, ${suppressed} suppressed, ${invalidEmails} invalid emails).`,
        actor: 'User',
        timestamp: new Date().toISOString(),
      });
    }

    return { imported, duplicates, suppressed, invalidEmails };
  }
}
