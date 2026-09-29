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

  // Ingest & Validate CSV rows into Leads with Smart Deduplication & Merging
  static processImport(
    rows: CSVRow[],
    mapping: ColumnMapping,
    tags: string[] = ['CSV Import'],
    userId: string = 'default_user'
  ): {
    imported: Lead[];
    mergedCount: number;
    duplicates: number;
    suppressed: number;
    invalidEmails: number;
  } {
    const imported: Lead[] = [];
    let mergedCount = 0;
    let duplicates = 0;
    let suppressed = 0;
    let invalidEmails = 0;

    const mappedHeaders = new Set(Object.values(mapping).filter(Boolean));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const row of rows) {
      const rawEmail = (row[mapping.email] || '').trim();
      const email = emailRegex.test(rawEmail) ? rawEmail : '';

      if (rawEmail && !email) {
        invalidEmails++;
      }

      // Check suppression list if email exists
      if (email && db.isSuppressed(email)) {
        suppressed++;
        continue;
      }

      const firstName = (row[mapping.firstName] || '').trim();
      const lastName = (row[mapping.lastName] || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();
      const company = (row[mapping.company] || (email ? email.split('@')[1]?.split('.')[0] : 'Unknown')).trim();
      const title = (row[mapping.title] || 'Decision Maker').trim();
      const phone = mapping.phone ? (row[mapping.phone] || '').trim() || undefined : undefined;
      const website = mapping.website ? (row[mapping.website] || '').trim() || undefined : undefined;
      const industry = mapping.industry ? (row[mapping.industry] || 'Technology').trim() : 'Technology';
      const employeeCount = mapping.employeeCount && row[mapping.employeeCount] ? Number(row[mapping.employeeCount]) || 50 : 50;

      // Collect unmapped columns into customAttributes
      const customAttributes: Record<string, any> = {};
      Object.keys(row).forEach((h) => {
        if (!mappedHeaders.has(h) && row[h] && row[h].trim()) {
          customAttributes[h] = row[h].trim();
        }
      });

      // Try finding existing matching lead in SQLite DB or current batch
      let existingMatch = db.findMatchingLead({
        email: email || undefined,
        name: fullName || undefined,
        company: company !== 'Unknown' ? company : undefined,
        website,
        phone,
      });

      if (!existingMatch && email) {
        existingMatch = imported.find((l) => l.email && l.email.toLowerCase() === email.toLowerCase());
      }

      if (existingMatch) {
        // Perform Smart Non-Destructive Merge into existing lead
        const mergedCustom = { ...existingMatch.customAttributes, ...customAttributes };
        const mergedTags = Array.from(new Set([...(existingMatch.tags || []), ...tags]));

        const updatedFirstName = existingMatch.firstName || firstName;
        const updatedLastName = existingMatch.lastName || lastName;
        const updatedEmail = existingMatch.email || email;
        const updatedPhone = existingMatch.phone || phone;
        const updatedCompany = existingMatch.company || company;
        const updatedTitle = existingMatch.title || title;
        const updatedWebsite = existingMatch.website || website;
        const updatedIndustry = existingMatch.industry || industry;
        const updatedEmployeeCount = existingMatch.employeeCount || employeeCount;

        const { score, breakdown } = this.calculateLeadScore({
          title: updatedTitle,
          industry: updatedIndustry,
          employeeCount: updatedEmployeeCount,
          phone: updatedPhone,
          website: updatedWebsite,
          firstName: updatedFirstName,
          lastName: updatedLastName,
        });

        const updatedLead = db.updateLead(existingMatch.id, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          email: updatedEmail,
          phone: updatedPhone,
          company: updatedCompany,
          title: updatedTitle,
          website: updatedWebsite,
          industry: updatedIndustry,
          employeeCount: updatedEmployeeCount,
          score,
          scoreBreakdown: breakdown,
          tags: mergedTags,
          customAttributes: mergedCustom,
          userId: existingMatch.userId || userId,
        });

        if (updatedLead) {
          // Update in-memory imported array if present
          const idx = imported.findIndex((l) => l.id === existingMatch.id);
          if (idx !== -1) imported[idx] = updatedLead;
          else imported.push(updatedLead);
          mergedCount++;
        } else {
          duplicates++;
        }
        continue;
      }

      // No match found -> Calculate ICP score and create new Lead
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
        verifiedEmail: Boolean(email),
        customAttributes,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.addLead(newLead);
      imported.push(newLead);
    }

    db.addAuditLog({
      id: `audit-${uuidv4().slice(0, 8)}`,
      eventType: 'LEADS_IMPORTED',
      entityType: 'Lead',
      entityId: 'batch',
      description: `Processed ${rows.length} CSV rows (${imported.length - mergedCount} new created, ${mergedCount} enriched & merged, ${suppressed} suppressed, ${invalidEmails} invalid emails).`,
      actor: 'User',
      timestamp: new Date().toISOString(),
    });

    return { imported, mergedCount, duplicates, suppressed, invalidEmails };
  }
}
