import {
  formatCurrency,
  type AgentBranding,
  type CostEstimate,
  type PropertyFacts,
} from '@list-price-plus/core';
import { jsPDF } from 'jspdf';

function propertySummary(facts: PropertyFacts): string {
  const parts: string[] = [];
  if (facts.listPrice) parts.push(formatCurrency(facts.listPrice));
  if (facts.beds !== undefined) parts.push(`${facts.beds} bd`);
  if (facts.baths !== undefined) parts.push(`${facts.baths} ba`);
  if (facts.sqft) parts.push(`${facts.sqft.toLocaleString()} sqft`);
  return parts.join(' · ') || 'Property listing';
}

export function downloadClientPdf(input: {
  listingTitle?: string;
  sourceUrl: string;
  facts: PropertyFacts;
  estimate: CostEstimate;
  branding: AgentBranding;
  shareUrl: string;
}): void {
  const { listingTitle, sourceUrl, facts, estimate, branding, shareUrl } = input;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const heading = listingTitle?.trim() || propertySummary(facts);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 118, 110);
  doc.text('List Price Plus', margin, y);
  y += 22;

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(heading, margin, y, { maxWidth: contentWidth });
  y += doc.getTextDimensions(heading, { maxWidth: contentWidth }).h + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.textWithLink(sourceUrl, margin, y, { url: sourceUrl, maxWidth: contentWidth });
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('ESTIMATED MONTHLY COST', margin, y);
  y += 16;

  doc.setFontSize(28);
  doc.setTextColor(15, 118, 110);
  doc.text(`${formatCurrency(estimate.monthlyTotal.mid)}/mo`, margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${formatCurrency(estimate.monthlyTotal.low)} – ${formatCurrency(estimate.monthlyTotal.high)}`,
    margin,
    y,
  );
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Monthly breakdown', margin, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const line of estimate.breakdown) {
    if (y > 680) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(71, 85, 105);
    doc.text(line.label, margin, y);
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(line.monthlyMid), pageWidth - margin, y, { align: 'right' });
    y += 14;
  }

  if (estimate.capexTimeline.length > 0) {
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Upcoming major expenses', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const event of estimate.capexTimeline.slice(0, 5)) {
      if (y > 680) {
        doc.addPage();
        y = margin;
      }
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${event.component} · ~${formatCurrency(event.estimatedCost)} · ${event.estimatedYear}`,
        margin,
        y,
        { maxWidth: contentWidth },
      );
      y += 14;
    }
  }

  y += 16;
  if (y > 640) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(branding.name, margin, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  for (const line of [branding.brokerage, branding.phone, branding.email]) {
    if (!line.trim()) continue;
    doc.text(line, margin, y);
    y += 13;
  }

  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const disclaimer = [
    estimate.assumptions.slice(0, 2).join(' '),
    'Estimates are illustrative, not financial advice.',
    `Full report: ${shareUrl}`,
  ]
    .filter(Boolean)
    .join(' ');
  const wrapped = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(wrapped, margin, y);

  const slug = (listingTitle ?? 'property-cost-report')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
    .toLowerCase();
  doc.save(`list-price-plus-${slug || 'report'}.pdf`);
}
