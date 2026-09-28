import { ReplyIntent } from '../../types/index.js';

export interface ClassificationResult {
  intent: ReplyIntent;
  confidence: number;
  reasoning: string;
  recommendedAction: string;
}

export class AIService {
  // Deterministic + Semantic Intent Classification
  static classifyReply(text: string): ClassificationResult {
    const lower = text.toLowerCase();

    // 1. Unsubscribe / Opt-out check (P0 Priority)
    if (
      lower.includes('unsubscribe') ||
      lower.includes('remove me') ||
      lower.includes('stop emailing') ||
      lower.includes('do not contact') ||
      lower.includes('take me off') ||
      lower.includes('opt out')
    ) {
      return {
        intent: 'UNSUBSCRIBE',
        confidence: 0.99,
        reasoning: 'Explicit opt-out request detected. Suppress email address and stop all sequences.',
        recommendedAction: 'Suppress contact and stop sequence.',
      };
    }

    // 2. Out of Office
    if (
      lower.includes('out of office') ||
      lower.includes('automated reply') ||
      lower.includes('auto-reply') ||
      lower.includes('on leave') ||
      lower.includes('annual leave') ||
      lower.includes('traveling until') ||
      lower.includes('limited access to email')
    ) {
      return {
        intent: 'OUT_OF_OFFICE',
        confidence: 0.98,
        reasoning: 'Automated out-of-office message detected. Pause sequence until return window.',
        recommendedAction: 'Pause sequence and set re-engagement task.',
      };
    }

    // 3. Meeting Request
    if (
      (lower.includes('calendar') || lower.includes('zoom') || lower.includes('meet') || lower.includes('call') || lower.includes('time') || lower.includes('schedule') || lower.includes('speak')) &&
      (lower.includes('thursday') || lower.includes('friday') || lower.includes('monday') || lower.includes('tuesday') || lower.includes('wednesday') || lower.includes('tomorrow') || lower.includes('next week') || lower.includes('available') || lower.includes('pm') || lower.includes('am'))
    ) {
      return {
        intent: 'MEETING_REQUEST',
        confidence: 0.96,
        reasoning: 'Prospect is actively proposing or requesting a time to meet / call.',
        recommendedAction: 'Send calendar booking link and create high-priority CRM Opportunity.',
      };
    }

    // 4. Pricing / Commercial Request
    if (
      lower.includes('price') ||
      lower.includes('pricing') ||
      lower.includes('cost') ||
      lower.includes('quote') ||
      lower.includes('how much') ||
      lower.includes('tier') ||
      lower.includes('seat license')
    ) {
      return {
        intent: 'PRICING_REQUEST',
        confidence: 0.92,
        reasoning: 'Prospect expresses direct interest in commercial terms, seat licensing, or volume costs.',
        recommendedAction: 'Review suggested pricing draft and send customized proposal.',
      };
    }

    // 5. Positive Interest
    if (
      lower.includes('interested') ||
      lower.includes('sounds good') ||
      lower.includes('tell me more') ||
      lower.includes('share more info') ||
      lower.includes('send a deck') ||
      lower.includes('send over details') ||
      lower.includes('timely')
    ) {
      return {
        intent: 'INTERESTED',
        confidence: 0.91,
        reasoning: 'Positive buying signal indicating appetite to learn more or review materials.',
        recommendedAction: 'Stop prospecting sequence and send tailored response with 1-click meeting link.',
      };
    }

    // 6. Direct Objection / Competitor Mention
    if (
      lower.includes('already use') ||
      lower.includes('already have') ||
      lower.includes('competitor') ||
      lower.includes('hubspot') ||
      lower.includes('apollo') ||
      lower.includes('salesforce') ||
      lower.includes('too expensive') ||
      lower.includes('no budget') ||
      lower.includes('what makes you different')
    ) {
      return {
        intent: 'OBJECTION',
        confidence: 0.88,
        reasoning: 'Prospect raises a competitive toolchain or budgetary objection.',
        recommendedAction: 'Apply grounded objection-handling response highlighting complementary integration.',
      };
    }

    // 7. Not Now / Timing
    if (
      lower.includes('not right now') ||
      lower.includes('revisit next quarter') ||
      lower.includes('next year') ||
      lower.includes('busy right now') ||
      lower.includes('check back in')
    ) {
      return {
        intent: 'NOT_NOW',
        confidence: 0.87,
        reasoning: 'Prospect indicates timing mismatch but leaves open future re-engagement.',
        recommendedAction: 'Acknowledge gracefully and schedule a reminder task for next quarter.',
      };
    }

    // 8. Not Interested
    if (
      lower.includes('not interested') ||
      lower.includes('no thanks') ||
      lower.includes('not a fit') ||
      lower.includes('pass')
    ) {
      return {
        intent: 'NOT_INTERESTED',
        confidence: 0.94,
        reasoning: 'Prospect explicitly declines the offer.',
        recommendedAction: 'Unenroll lead from campaign to preserve domain reputation.',
      };
    }

    return {
      intent: 'QUESTION',
      confidence: 0.75,
      reasoning: 'Prospect response requires human interpretation or custom clarification.',
      recommendedAction: 'Review thread manually and select custom reply template.',
    };
  }

  // Grounded AI Reply Drafter (Human-in-the-loop)
  static generateDraftReply(
    incomingText: string,
    contactName: string,
    company: string,
    intent: ReplyIntent
  ): string {
    const firstName = contactName ? contactName.split(' ')[0] : 'there';

    switch (intent) {
      case 'MEETING_REQUEST':
        return `Hi ${firstName},\n\nThank you for getting back to me! I would be delighted to connect. Would Thursday at 2:00 PM EST or Friday at 11:00 AM EST work better for you?\n\nYou can also pick any convenient slot directly on my calendar here: https://cal.com/outboundgrowth/15min\n\nLooking forward to speaking!\n\nBest,\nAlex`;

      case 'PRICING_REQUEST':
        return `Hi ${firstName},\n\nThanks for reaching out regarding pricing. Our platform is structured into Starter ($99/mo for founders) and Growth ($180/seat/mo with unlimited connected mailboxes, AI reply intent routing, and real-time CRM sync).\n\nCould you share how many sales reps or active mailboxes ${company} is looking to equip? I can prepare an exact quote for your team.\n\nBest,\nAlex`;

      case 'OBJECTION':
        return `Hi ${firstName},\n\nCompletely understand! Many of our fastest-growing customers also keep Apollo for data sourcing and HubSpot as their primary CRM. Where our operating system excels is the reply-to-revenue automation: we sit on top of your mailboxes, classify incoming replies with 95%+ precision, and move deals into HubSpot without reps having to manually copy-paste threads.\n\nOpen to a brief 5-minute video demonstrating how they coexist seamlessly?\n\nBest,\nAlex`;

      case 'NOT_NOW':
        return `Hi ${firstName},\n\nUnderstood completely—timing is everything. I will make a note to check back in next quarter to see how your outbound pipeline priorities have evolved.\n\nWishing you and the ${company} team a great rest of the month!\n\nBest,\nAlex`;

      case 'INTERESTED':
        return `Hi ${firstName},\n\nGreat to hear! I've attached our 2-page product brief detailing how our AI outbound CRM helps teams generate qualified pipeline with zero manual data entry.\n\nWould you be open to a 10-minute discovery call this Thursday to see it in action?\n\nBest,\nAlex`;

      default:
        return `Hi ${firstName},\n\nThank you for following up. Regarding your question, our platform connects natively to your Google Workspace and Microsoft 365 mailboxes so that every outbound touch, reply classification, and deal stage syncs in real time.\n\nWould it be helpful to schedule a quick 10-minute walkthrough?\n\nBest,\nAlex`;
    }
  }
}
