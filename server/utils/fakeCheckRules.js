// Rule-based red-flag scoring for the Fake Internship Checker.
// Takes the free-text fields from the "Check a Listing" form (title, company, salary,
// contact, description) and scans them for known scam patterns. This is a transparent,
// explainable heuristic (good for a viva) rather than a trained ML model.

const FEE_KEYWORDS = [
  'registration fee', 'security deposit', 'processing fee', 'refundable deposit',
  'training fee', 'pay ₹', 'pay rs', 'one-time payment', 'activation fee', 'joining fee',
]

const VAGUE_PHRASES = [
  'work from home', 'earn money', 'flexible hours', 'no experience needed', 'easy work',
]

const NO_INTERVIEW_PHRASES = [
  'no interview', 'instant offer', 'immediate joining', 'without interview', 'guaranteed selection',
  'guaranteed job', '100% placement',
]

const SKILL_WORDS = [
  'react', 'javascript', 'python', 'java', 'node', 'sql', 'html', 'css', 'design',
  'marketing', 'sales', 'writing', 'analysis', 'testing', 'communication', 'excel',
]

function containsAny(text, phrases) {
  const lower = text.toLowerCase()
  return phrases.some((p) => lower.includes(p))
}

// Looks for stipend claims that are unrealistically high for an internship,
// e.g. "₹5000/day", "₹50000/week", "earn 1 lakh per month".
function looksUnrealistic(salaryText, titleText) {
  const text = `${salaryText} ${titleText}`.toLowerCase()

  const perDayMatch = text.match(/(?:₹|rs\.?)?\s?(\d{3,6})\s?\/?\s*(?:per\s)?day/)
  if (perDayMatch && Number(perDayMatch[1]) >= 1000) return true

  const perWeekMatch = text.match(/(?:₹|rs\.?)?\s?(\d{4,7})\s?\/?\s*(?:per\s)?week/)
  if (perWeekMatch && Number(perWeekMatch[1]) >= 10000) return true

  if (text.includes('lakh') && (text.includes('day') || text.includes('week'))) return true
  if (text.includes('commission based') && !text.includes('base')) return true

  return false
}

export function scoreInternship({ title = '', company = '', salary = '', contact = '', description = '' } = {}) {
  const flags = []
  let score = 0

  if (containsAny(`${title} ${salary} ${description}`, FEE_KEYWORDS)) {
    flags.push({ label: 'Mentions an upfront fee, deposit, or payment before hiring', severity: 'high' })
    score += 35
  }

  if (looksUnrealistic(salary, title)) {
    flags.push({ label: 'Stipend/salary looks unrealistically high for the role described', severity: 'high' })
    score += 25
  }

  if (containsAny(contact, ['whatsapp', 'telegram'])) {
    flags.push({ label: 'Contact is only through WhatsApp/Telegram, not an official email or portal', severity: 'medium' })
    score += 15
  } else if (contact.trim() === '') {
    flags.push({ label: 'No contact method provided to verify the recruiter', severity: 'low' })
    score += 5
  }

  if (containsAny(description, NO_INTERVIEW_PHRASES)) {
    flags.push({ label: 'Promises an instant offer with no interview or selection process', severity: 'medium' })
    score += 15
  }

  const desc = description.trim()
  const hasSkillMention = SKILL_WORDS.some((w) => desc.toLowerCase().includes(w))
  if (desc.length > 0 && desc.length < 60 && !hasSkillMention) {
    flags.push({ label: 'Job description is vague with no real skills or responsibilities listed', severity: 'medium' })
    score += 15
  } else if (containsAny(desc, VAGUE_PHRASES) && !hasSkillMention) {
    flags.push({ label: 'Description leans on generic buzzwords rather than specific responsibilities', severity: 'low' })
    score += 10
  }

  if (company.trim() === '') {
    flags.push({ label: 'No company name provided — cannot verify the employer at all', severity: 'medium' })
    score += 10
  }

  score = Math.min(100, score)

  let verdict = 'LIKELY SAFE'
  if (score >= 60) verdict = 'FAKE'
  else if (score >= 35) verdict = 'SUSPICIOUS'
  else if (score >= 15) verdict = 'REVIEW'

  return { score, verdict, flags }
}
