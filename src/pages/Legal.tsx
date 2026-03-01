import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

const tabs = ["Terms", "Privacy", "Policies", "Disclosures"];

/* ───────────────────── TERMS OF SERVICE ───────────────────── */
const termsSections = [
  {
    title: "1. Introduction & Acceptance",
    content: `These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", "your") and FindOO Technologies Private Limited ("FindOO", "we", "us", "our"), a company incorporated under the Companies Act, 2013, with its registered office in Mumbai, Maharashtra, India. By accessing or using the FindOO platform, mobile application, and related services (collectively, the "Platform"), you agree to be bound by these Terms, our Privacy Policy, Community Guidelines, and all applicable policies. If you do not agree, you must not access or use the Platform. These Terms supersede any prior agreements between you and FindOO regarding your use of the Platform.`,
  },
  {
    title: "2. Definitions",
    content: `"Content" means any text, images, documents, posts, comments, messages, research notes, market commentary, or other materials uploaded, submitted, or displayed on the Platform. "Issuer" means an entity that issues financial products or securities, including Asset Management Companies, Insurance Companies, NBFCs, and similar entities regulated by SEBI, RBI, IRDAI, or PFRDA. "Intermediary" means a financial intermediary registered with one or more Indian financial regulators, including Mutual Fund Distributors (AMFI), Insurance Agents/Brokers (IRDAI), Research Analysts (SEBI), Investment Advisors (SEBI), Stock Brokers (SEBI), and similar registered professionals. "Investor" means an individual or entity that accesses the Platform for networking, information gathering, or professional engagement within the financial services ecosystem. "Verified User" means a User whose regulatory credentials have been validated through FindOO's verification process. "Services" means all features, tools, functionalities, and services provided through the Platform.`,
  },
  {
    title: "3. Eligibility",
    content: `You must be at least 18 years of age and competent to enter into a binding contract under the Indian Contract Act, 1872, to use the Platform. By creating an account, you represent and warrant that: (a) you meet the minimum age requirement; (b) all registration information you provide is truthful, accurate, and complete; (c) you are authorized to use the Platform in your stated capacity as an Issuer, Intermediary, or Investor; (d) if registering as an Intermediary or Issuer, you hold valid registrations with the relevant Indian financial regulators (SEBI, RBI, IRDAI, AMFI, or PFRDA); and (e) your use of the Platform does not violate any applicable law, regulation, or order. FindOO reserves the right to refuse registration or terminate access to any User who does not meet these eligibility requirements.`,
  },
  {
    title: "4. Account Registration, Verification & Security",
    content: `4.1 Registration: Each User must create a single account representing their individual or entity identity. Account sharing, selling, transferring, or delegation is strictly prohibited. Organization accounts must be created and managed by authorized representatives.

4.2 Verification: Issuers and Intermediaries are required to submit regulatory credentials (including but not limited to SEBI registration certificates, AMFI ARN numbers, IRDAI license numbers, RBI registration details, or PFRDA POP/NPS registrations) for verification. FindOO verifies credentials against publicly available regulatory databases and records. Verification confirms registration status at the time of verification only and does not constitute an endorsement of competence, conduct, or future compliance. FindOO may periodically re-verify credentials and may revoke verified status if a User's registration is found to be lapsed, suspended, or revoked by the relevant regulator.

4.3 Account Security: You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must immediately notify FindOO at security@findoo.in of any unauthorized access or suspected breach. FindOO shall not be liable for any loss arising from unauthorized use of your account where such use was not attributable to FindOO's negligence.`,
  },
  {
    title: "5. User Conduct & Acceptable Use",
    content: `By using the Platform, you agree to: (a) comply with all applicable Indian laws including the Information Technology Act, 2000, Securities and Exchange Board of India Act, 1992, Reserve Bank of India Act, 1934, Insurance Regulatory and Development Authority of India Act, 1999, and all rules, regulations, circulars, and guidelines issued thereunder; (b) not share unregistered investment advice, stock tips, or portfolio recommendations unless you are a SEBI-registered Investment Advisor or Research Analyst acting within the scope of your registration; (c) not post insider information or content that could constitute market manipulation, front-running, or fraudulent inducement under SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations; (d) not engage in harassment, hate speech, defamation, impersonation, or intimidation; (e) not post spam, unsolicited commercial messages, or engage in automated mass interactions; (f) not scrape, harvest, or collect data from the Platform through automated means without express written permission; (g) not attempt to reverse-engineer, decompile, or access the Platform's source code or proprietary systems; (h) not use the Platform to solicit clients, distribute unregulated financial products, or conduct any activity that would require regulatory registration without possessing such registration; and (i) include appropriate disclaimers with market commentary as required by applicable SEBI regulations.`,
  },
  {
    title: "6. Content & Intellectual Property",
    content: `6.1 Your Content: You retain ownership of all Content you create and post on the Platform. By posting Content, you grant FindOO a non-exclusive, worldwide, royalty-free, transferable, sub-licensable license to use, reproduce, modify, adapt, publish, display, and distribute such Content in connection with operating and improving the Platform. This license continues for a commercially reasonable period after you delete Content from the Platform, except where retention is required by law or legitimate business purposes.

6.2 Platform IP: All intellectual property in the Platform, including its design, code, logos, trademarks ("FindOO" and associated branding), algorithms, databases, and documentation, is the exclusive property of FindOO Technologies Private Limited or its licensors. No license or right is granted to you other than the limited right to use the Platform as described in these Terms.

6.3 Copyright Claims: If you believe Content on the Platform infringes your copyright, you may submit a notice under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, to our Grievance Officer at grievance@findoo.in. Your notice must include identification of the copyrighted work, the infringing material, your contact details, and a statement of good faith belief.

6.4 AI & Machine Learning: FindOO may use aggregated, anonymized, or de-identified data derived from Platform usage to improve its services, algorithms, and recommendation systems. No individually identifiable Content will be used for AI model training without explicit opt-in consent from the User.`,
  },
  {
    title: "7. Services Provided & Platform Role",
    content: `FindOO is a professional networking platform that facilitates connections and information exchange between financial market participants. FindOO expressly does not: (a) provide financial advice, investment recommendations, or portfolio management services; (b) act as a stock exchange, broker, dealer, depository, or custodian; (c) guarantee the accuracy, completeness, or reliability of any user-generated Content; (d) guarantee investment returns or financial outcomes; (e) act as a party to any financial transaction between Users; or (f) verify the ongoing compliance or conduct of any Verified User beyond the initial credential verification. The Platform may facilitate job postings, event listings, directory listings, and content sharing as part of its networking services. These features are informational and do not constitute endorsement of any User, product, service, or opportunity listed.`,
  },
  {
    title: "8. Fees & Payments",
    content: `FindOO currently offers free access to its core networking features. FindOO reserves the right to introduce premium features, subscription tiers, or transaction-based fees in the future. Any paid features will be subject to separate terms and conditions, including pricing, billing cycles, cancellation, and refund policies, which will be presented to you before purchase. All applicable taxes, including Goods and Services Tax (GST), shall be borne by the User as required by law.`,
  },
  {
    title: "9. Third-Party Links & Services",
    content: `The Platform may contain links to third-party websites, services, or applications, including regulatory databases, job portals, event platforms, and financial product information pages. FindOO does not endorse, control, or assume responsibility for the content, privacy practices, or availability of any third-party services. Your interaction with third-party services is governed by their respective terms and policies. Any reliance on third-party content is at your own risk.`,
  },
  {
    title: "10. Disclaimers",
    content: `THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. FINDOO DISCLAIMS ALL WARRANTIES INCLUDING, WITHOUT LIMITATION, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. FINDOO DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. CONTENT ON THE PLATFORM, INCLUDING MARKET COMMENTARY, RESEARCH NOTES, AND OPINIONS SHARED BY USERS, DOES NOT CONSTITUTE FINANCIAL ADVICE. INVESTMENTS IN SECURITIES MARKETS ARE SUBJECT TO MARKET RISKS. PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS. USERS SHOULD CONSULT QUALIFIED, REGISTERED FINANCIAL ADVISORS BEFORE MAKING ANY INVESTMENT DECISIONS.`,
  },
  {
    title: "11. Limitation of Liability",
    content: `To the maximum extent permitted under applicable Indian law: (a) FindOO shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to loss of profits, data, goodwill, business opportunities, or financial losses arising from Content viewed or interactions conducted on the Platform; (b) FindOO's total aggregate liability for any claims arising from or related to these Terms or your use of the Platform shall not exceed the amount paid by you to FindOO, if any, in the twelve (12) months preceding the claim, or INR 10,000, whichever is greater; (c) FindOO shall not be liable for any acts or omissions of Users, including Verified Users, or for any financial decisions made based on Content available on the Platform.`,
  },
  {
    title: "12. Indemnification",
    content: `You agree to indemnify, defend, and hold harmless FindOO, its directors, officers, employees, agents, and affiliates from and against all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from: (a) your use of the Platform; (b) your Content; (c) your violation of these Terms, applicable laws, or any third-party rights; (d) any misrepresentation regarding your regulatory status or credentials; or (e) any financial advice, recommendation, or opinion you provide through the Platform without appropriate regulatory registration.`,
  },
  {
    title: "13. Termination & Suspension",
    content: `13.1 By You: You may terminate your account at any time through your account settings or by contacting support@findoo.in. Upon termination, your right to use the Platform ceases immediately.

13.2 By FindOO: FindOO may suspend, restrict, or terminate your account at any time, with or without notice, for: (a) violation of these Terms or Community Guidelines; (b) provision of false or misleading information; (c) lapse, suspension, or revocation of your regulatory registration; (d) engagement in activities harmful to the Platform or its Users; (e) prolonged inactivity (accounts inactive for over 24 months); or (f) any other reason at FindOO's reasonable discretion.

13.3 Effect of Termination: Upon termination, your license to use the Platform is revoked. FindOO may retain your data as required by applicable law, including for compliance, dispute resolution, and regulatory purposes. Content you posted that has been shared, referenced, or cited by other Users may remain on the Platform in anonymized form.`,
  },
  {
    title: "14. Governing Law & Dispute Resolution",
    content: `14.1 Governing Law: These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.

14.2 Dispute Resolution: Any dispute, controversy, or claim arising out of or relating to these Terms shall first be attempted to be resolved through good-faith negotiation between the parties for a period of thirty (30) days. If the dispute remains unresolved, it shall be referred to and finally resolved by arbitration administered in accordance with the Arbitration and Conciliation Act, 1996, as amended. The arbitration shall be conducted by a sole arbitrator mutually appointed by the parties. The seat of arbitration shall be Mumbai, Maharashtra. The language of arbitration shall be English. The arbitral award shall be final and binding on both parties.

14.3 Jurisdiction: Subject to the arbitration clause above, the courts of Mumbai, Maharashtra shall have exclusive jurisdiction over any disputes arising from these Terms.

14.4 Grievance Redressal: In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, FindOO has appointed a Grievance Officer. Complaints and grievances may be addressed to: Grievance Officer, FindOO Technologies Private Limited, Email: grievance@findoo.in. The Grievance Officer shall acknowledge complaints within 24 hours and resolve them within 15 days of receipt, or such other period as prescribed by applicable law.`,
  },
  {
    title: "15. General Provisions",
    content: `15.1 Entire Agreement: These Terms, together with the Privacy Policy, Community Guidelines, and any additional terms for specific features, constitute the entire agreement between you and FindOO regarding your use of the Platform.

15.2 Severability: If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.

15.3 No Waiver: FindOO's failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.

15.4 Assignment: You may not assign or transfer your rights under these Terms without FindOO's prior written consent. FindOO may assign its rights and obligations under these Terms without restriction.

15.5 Force Majeure: FindOO shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to natural disasters, pandemics, government actions, regulatory changes, war, terrorism, strikes, or technology failures.

15.6 Modifications: FindOO reserves the right to modify these Terms at any time. Material changes will be communicated via email, in-app notification, or prominent notice on the Platform at least 30 days prior to taking effect. Your continued use of the Platform after the effective date of modifications constitutes acceptance of the revised Terms.`,
  },
  {
    title: "16. Contact Information",
    content: `For questions regarding these Terms of Service, please contact:

FindOO Technologies Private Limited
Email: legal@findoo.in
Grievance Officer: grievance@findoo.in
Support: support@findoo.in`,
  },
];

/* ───────────────────── PRIVACY POLICY ───────────────────── */
const privacySections = [
  {
    title: "1. Introduction",
    content: `This Privacy Policy ("Policy") describes how FindOO Technologies Private Limited ("FindOO", "we", "us", "our") collects, uses, shares, protects, and retains your personal information when you use the FindOO platform, mobile application, and related services (collectively, the "Platform"). This Policy is published in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023 ("DPDP Act"). By using the Platform, you consent to the collection and use of your information as described in this Policy.`,
  },
  {
    title: "2. Information We Collect",
    content: `2.1 Information You Provide: (a) Registration data: full name, email address, phone number, date of birth, and password; (b) Professional information: organization name, designation, regulatory registration numbers (SEBI, AMFI ARN, IRDAI license, RBI registration, PFRDA POP/NPS), certifications, specializations, and experience; (c) Profile data: biography, headline, profile photo, banner image, location, languages, website URL, and social media links; (d) Content: posts, comments, messages, research notes, market commentary, event details, job postings, directory listings, and uploaded documents; (e) Verification documents: regulatory certificates, identity proofs, and other documents submitted for credential verification; (f) Communications: messages you send to other Users or to FindOO support.

2.2 Information Collected Automatically: (a) Device information: device type, operating system, browser type, screen resolution, and unique device identifiers; (b) Log data: IP address, access timestamps, pages visited, features used, referral URLs, and interaction patterns; (c) Location data: approximate location derived from IP address (precise location only with explicit consent); (d) Cookies and similar technologies: session cookies for authentication, preference cookies for settings, and analytics cookies for understanding usage patterns (see Section 8).

2.3 Information from Third Parties: (a) Regulatory databases: verification data from SEBI, AMFI, IRDAI, RBI, and PFRDA public registries; (b) Authentication providers: if you use third-party sign-in (Google, LinkedIn), we receive your basic profile information as authorized by you.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We process your information for the following purposes: (a) Account management: creating, maintaining, and authenticating your account; (b) Platform services: enabling networking, content sharing, messaging, event management, job listings, and directory features; (c) Verification: validating your regulatory credentials against official databases; (d) Personalization: customizing your feed, recommendations, and content discovery based on your professional interests and network; (e) Communications: sending service-related notifications, security alerts, and platform updates; (f) Safety and security: detecting, preventing, and responding to fraud, abuse, security threats, and policy violations; (g) Analytics: understanding platform usage patterns through aggregated, anonymized data to improve our services; (h) Legal compliance: fulfilling obligations under the IT Act, DPDP Act, SEBI regulations, and other applicable laws; (i) Dispute resolution: resolving complaints, enforcing our Terms, and responding to legal processes; and (j) Research: conducting surveys and gathering feedback to improve the Platform (participation is always voluntary).`,
  },
  {
    title: "4. Legal Basis for Processing (DPDP Act, 2023)",
    content: `Under the Digital Personal Data Protection Act, 2023, we process your personal data based on the following lawful grounds: (a) Consent: for processing your personal data during registration, profile creation, and content sharing — you provide consent by creating an account and using the Platform; (b) Legitimate uses: for processing necessary to fulfill our obligations under these Terms, comply with Indian law, respond to legal processes, or protect the vital interests of Users; (c) Contractual necessity: for processing required to deliver the services you have requested. You have the right to withdraw consent at any time by deleting your account or adjusting your privacy settings; however, withdrawal may limit your ability to use certain Platform features.`,
  },
  {
    title: "5. Information Sharing",
    content: `We do not sell your personal data. We may share your information in the following circumstances:

5.1 With Other Users: Your profile information (name, headline, organization, verification status) is visible to other Platform users based on your privacy settings. Content you post publicly is visible to all Users.

5.2 With Regulatory Authorities: We may share information with SEBI, RBI, IRDAI, AMFI, PFRDA, law enforcement agencies, or other government authorities when: (a) required by law, regulation, subpoena, court order, or legal process; (b) necessary to prevent fraud, security threats, or violations of law; (c) required for regulatory compliance or investigation.

5.3 With Service Providers: We engage trusted third-party service providers for hosting, analytics, email delivery, customer support, and payment processing. These providers are contractually bound to use your data only for the purposes we specify and to maintain adequate security measures.

5.4 Business Transfers: In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have.

5.5 With Your Consent: We may share your information for other purposes with your explicit consent.`,
  },
  {
    title: "6. Data Security",
    content: `We implement reasonable security practices and procedures as required under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, including: (a) encryption of data in transit (TLS/SSL) and at rest (AES-256); (b) secure authentication mechanisms including password hashing and optional two-factor authentication; (c) role-based access controls limiting internal access to personal data on a need-to-know basis; (d) regular security assessments and vulnerability testing; (e) incident response procedures for data breach notification as required under the DPDP Act; and (f) secure cloud infrastructure with data stored on servers located in India or in jurisdictions with adequate data protection standards. While we strive to protect your information, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "7. Your Rights Under Indian Law",
    content: `Under the DPDP Act, 2023, and other applicable Indian laws, you have the following rights: (a) Right to Access: obtain confirmation of whether your personal data is being processed and access such data; (b) Right to Correction: request correction of inaccurate or misleading personal data; (c) Right to Erasure: request deletion of your personal data (subject to legal retention requirements); (d) Right to Nominate: appoint a nominee to exercise your data rights in case of your death or incapacity; (e) Right to Grievance Redressal: file complaints with our Grievance Officer or, if unresolved, with the Data Protection Board of India established under the DPDP Act; (f) Right to Withdraw Consent: withdraw previously given consent for data processing; and (g) Right to Data Portability: request your data in a structured, commonly used, machine-readable format. To exercise any of these rights, contact us at privacy@findoo.in. We will respond to your request within 30 days or such period as prescribed by applicable law.`,
  },
  {
    title: "8. Cookies & Tracking Technologies",
    content: `FindOO uses the following types of cookies: (a) Strictly Necessary Cookies: required for authentication, session management, and security — these cannot be disabled; (b) Functional Cookies: remember your preferences such as language, theme, and display settings; (c) Analytics Cookies: help us understand how Users interact with the Platform through aggregated, anonymized usage statistics; (d) Performance Cookies: monitor Platform performance and load times to improve user experience. We do not use advertising or third-party tracking cookies. You can manage cookie preferences through your browser settings. Disabling strictly necessary cookies may affect Platform functionality. For more details, refer to our Cookie Policy (available in your account settings).`,
  },
  {
    title: "9. Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide Services. Specific retention periods: (a) Active account data: retained for the duration of your account; (b) Post-deletion: personal data is deleted within 90 days of account deletion, except where retention is required by law; (c) Legal retention: audit logs, regulatory verification records, and financial transaction data may be retained for up to 8 years as required under Indian tax laws, SEBI regulations, and the Companies Act, 2013; (d) Aggregated data: anonymized, aggregated data that does not identify individuals may be retained indefinitely for analytics and research purposes; (e) Backup systems: data in backup systems is purged according to standard backup rotation schedules, typically within 180 days.`,
  },
  {
    title: "10. Cross-Border Data Transfers",
    content: `FindOO primarily stores and processes data within India. Where data transfer outside India is necessary (e.g., for cloud service providers), we ensure compliance with the DPDP Act, 2023, including: (a) transferring data only to jurisdictions or entities that provide adequate data protection; (b) implementing appropriate contractual safeguards with data processors; and (c) notifying users where required. We do not transfer personal data to jurisdictions restricted by the Central Government under the DPDP Act.`,
  },
  {
    title: "11. Children's Privacy",
    content: `The Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal data from minors. If we become aware that we have inadvertently collected personal data from a person under 18, we will take steps to delete such data promptly. If you believe a minor has provided us with personal data, please contact us at privacy@findoo.in.`,
  },
  {
    title: "12. Changes to This Policy",
    content: `We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or regulatory guidance. Material changes will be communicated via: (a) email notification to registered users; (b) in-app notification or banner; and (c) prominent notice on the Platform. The "Last Updated" date at the top of this Policy will be revised accordingly. Your continued use of the Platform after the effective date of changes constitutes acceptance of the updated Policy.`,
  },
  {
    title: "13. Grievance Officer & Contact",
    content: `In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the DPDP Act, 2023, FindOO has appointed a Grievance Officer:

Grievance Officer
FindOO Technologies Private Limited
Email: grievance@findoo.in

For privacy-related inquiries, data access requests, or concerns:
Data Protection Officer: privacy@findoo.in
General Support: support@findoo.in

The Grievance Officer shall acknowledge your complaint within 24 hours and resolve it within 15 days of receipt, or such other period as prescribed by applicable law. If you are unsatisfied with the resolution, you may approach the Data Protection Board of India under the DPDP Act, 2023.`,
  },
];

/* ───────────────────── POLICIES ───────────────────── */
const policiesSections = [
  {
    title: "1. Content Policy",
    content: `All Content shared on FindOO must comply with Indian financial regulations and the Platform's Community Guidelines. Users may not: (a) share unregistered investment advice — only SEBI-registered Investment Advisors (under SEBI (Investment Advisers) Regulations, 2013) and Research Analysts (under SEBI (Research Analysts) Regulations, 2014) may provide investment advice or research reports, and must do so within the scope of their registration; (b) post insider information or unpublished price-sensitive information (UPSI) as defined under SEBI (Prohibition of Insider Trading) Regulations, 2015; (c) post content designed to manipulate markets, create artificial demand/supply, or engage in front-running; (d) make claims about guaranteed returns, risk-free investments, or assured capital protection unless the underlying product is expressly guaranteed by the issuer; (e) post misleading comparisons of financial products; or (f) share content that violates the Advertising Standards Council of India (ASCI) guidelines or SEBI circular on advertisements by intermediaries. All market commentary must include appropriate disclaimers such as: "This is for informational purposes only and does not constitute investment advice. Please consult a SEBI-registered advisor before making investment decisions."`,
  },
  {
    title: "2. Advertising & Promotion Policy",
    content: `2.1 Labeling: All paid promotions, sponsored content, affiliate links, and commercial endorsements must be clearly and prominently labeled as "Sponsored", "Paid Partnership", or "Advertisement."

2.2 Financial Product Advertising: Advertisements for financial products must comply with: (a) SEBI (Mutual Funds) Regulations — mutual fund advertisements must include the standard AMFI disclaimer; (b) IRDAI advertising guidelines for insurance products; (c) RBI guidelines for deposit and lending product advertisements; (d) SEBI guidelines on advertisements by intermediaries. Advertisements for unregulated financial products, cryptocurrency exchanges (where not permitted under Indian law), or Ponzi/multi-level marketing schemes are strictly prohibited.

2.3 Endorsements: Users who receive compensation for promoting products or services must disclose the commercial relationship. Failure to disclose paid endorsements may result in content removal and account action.`,
  },
  {
    title: "3. Anti-Spam & Automated Activity Policy",
    content: `To maintain the integrity of the Platform: (a) automated posting, scheduled bulk messaging, and bot-driven interactions are prohibited unless explicitly authorized by FindOO; (b) repetitive posting of identical or substantially similar Content is considered spam; (c) creating multiple accounts to amplify reach, evade bans, or manipulate engagement metrics is prohibited; (d) use of third-party automation tools to interact with the Platform (including auto-follow, auto-like, or auto-comment tools) is prohibited; (e) unsolicited commercial messages, including direct messages promoting products, services, or opportunities, are not permitted; and (f) harvesting or scraping user contact information (email addresses, phone numbers) from the Platform for external marketing purposes is strictly prohibited.`,
  },
  {
    title: "4. Intellectual Property Policy",
    content: `4.1 Respect for IP Rights: Users must respect intellectual property rights. Content that infringes on copyrights, trademarks, trade secrets, or proprietary information will be removed upon valid notice.

4.2 DMCA-Equivalent Process: FindOO follows the takedown procedures prescribed under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. To report IP infringement, contact grievance@findoo.in with: (a) identification of the copyrighted/trademarked work; (b) URL or description of the infringing material; (c) your contact details; (d) a good faith statement that the use is unauthorized; and (e) a statement under penalty of perjury that the information is accurate and you are authorized to act on behalf of the rights holder.

4.3 Repeat Infringers: Accounts that are subject to three or more valid IP infringement notices will be permanently terminated.`,
  },
  {
    title: "5. Account Integrity Policy",
    content: `5.1 Real Identity: Every account must represent a real individual or legally registered entity. Pseudonymous accounts are not permitted. Users must use their legal name (for individuals) or registered entity name (for organizations).

5.2 Single Account: Each individual may maintain only one personal account. Organizations may have one entity account managed by authorized representatives.

5.3 Impersonation: Creating accounts that impersonate other individuals, organizations, regulators, or government bodies is strictly prohibited and may result in immediate termination and legal action.

5.4 Account Selling/Transfer: The sale, purchase, or transfer of FindOO accounts is prohibited.`,
  },
  {
    title: "6. Data Protection & Scraping Policy",
    content: `6.1 Data Scraping: Automated scraping, crawling, harvesting, or any form of automated data collection from the Platform is strictly prohibited without FindOO's express written permission.

6.2 API Usage: Access to any FindOO APIs, if made available, must comply with our Developer Terms and applicable rate limits.

6.3 Data Export: Users may export their own data through account settings. Re-distribution, sale, or commercial use of other Users' data obtained from the Platform is prohibited.

6.4 Confidentiality: Content shared in private messages, restricted-visibility posts, or closed groups must not be copied, screenshot, or redistributed without the content owner's consent.`,
  },
  {
    title: "7. Enforcement & Appeals",
    content: `7.1 Graduated Enforcement: FindOO employs a graduated enforcement approach: (a) Warning — for first-time minor violations; (b) Content Removal — for Content that violates policies; (c) Feature Restriction — temporary restriction of posting, messaging, or other features; (d) Temporary Suspension — account suspension for 7-30 days for repeated or serious violations; (e) Permanent Termination — for severe violations, persistent re-offenses, or activities posing legal or safety risks.

7.2 Appeals: Users may appeal enforcement actions by contacting appeals@findoo.in within 30 days of the action. Appeals are reviewed by a different team member than the one who made the original decision. FindOO will respond to appeals within 15 business days.

7.3 Reporting: Users can report violations using the in-app report button on any post, comment, or profile, or by emailing moderation@findoo.in. All reports are reviewed within 48 hours.`,
  },
];

/* ───────────────────── DISCLOSURES ───────────────────── */
const disclosureSections = [
  {
    title: "1. Platform Disclosure",
    content: `FindOO is a technology platform operated by FindOO Technologies Private Limited, a company incorporated under the Companies Act, 2013, in India. FindOO facilitates professional networking between participants in the Indian financial services ecosystem. FindOO is NOT: (a) a stock exchange recognized under the Securities Contracts (Regulation) Act, 1956; (b) a SEBI-registered stock broker, sub-broker, investment advisor, research analyst, portfolio manager, or any other market intermediary; (c) a bank or NBFC registered with the Reserve Bank of India; (d) an insurance company or intermediary registered with IRDAI; (e) a depository or depository participant; (f) a merchant banker, underwriter, or registrar to an issue. The Platform does not provide financial advice, investment recommendations, portfolio management services, or facilitate securities transactions.`,
  },
  {
    title: "2. Regulatory Status",
    content: `FindOO Technologies Private Limited is a technology company and is classified as an "intermediary" as defined under Section 2(1)(w) of the Information Technology Act, 2000, and operates in compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. FindOO is NOT registered with SEBI, RBI, IRDAI, AMFI, PFRDA, or any other financial regulator as a market intermediary, advisor, or financial service provider. Individual Users on the Platform may hold registrations with these regulatory bodies, and such registrations are independently verified through publicly available regulatory databases. FindOO's verification process confirms regulatory registration status at the time of verification only.`,
  },
  {
    title: "3. Investment Risk Disclosure",
    content: `IMPORTANT: INVESTMENTS IN SECURITIES/FINANCIAL INSTRUMENTS ARE SUBJECT TO MARKET RISKS. THERE IS NO ASSURANCE OR GUARANTEE OF RETURNS. PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS.

Content shared on FindOO, including but not limited to market commentary, research notes, investment opinions, financial product listings, and user discussions: (a) does not constitute investment advice, an offer, or solicitation for the purchase or sale of any financial instrument; (b) should not be construed as a recommendation by FindOO or any User unless the User is a SEBI-registered advisor acting within the scope of their registration; (c) may contain forward-looking statements that involve risks and uncertainties; (d) may not reflect the most current market conditions or regulatory developments.

Users should: (a) conduct their own due diligence before making investment decisions; (b) consult qualified, SEBI-registered financial advisors; (c) read all scheme-related documents carefully before investing; (d) consider their risk appetite, investment horizon, and financial goals; and (e) not rely solely on information available on the Platform for making investment decisions.

Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing.`,
  },
  {
    title: "4. Verification Disclosure",
    content: `FindOO's verification process validates User credentials against publicly available regulatory databases maintained by SEBI, AMFI, IRDAI, RBI, PFRDA, and other relevant bodies. Important limitations of verification: (a) Verification confirms regulatory registration status at the time of verification and does not constitute an ongoing guarantee; (b) Verification does not constitute an endorsement of a User's competence, integrity, investment performance, or suitability for any particular service; (c) Regulatory registrations may be suspended, revoked, or allowed to lapse after FindOO's verification date; (d) FindOO is not responsible for the acts, omissions, advice, or recommendations of any Verified User; (e) Users should independently verify the current registration status of any financial professional through official regulatory websites (e.g., sebi.gov.in, amfiindia.com, irdai.gov.in); and (f) The "Verified" badge indicates successful credential validation through FindOO's process and should not be interpreted as a government or regulatory endorsement.`,
  },
  {
    title: "5. Data & Privacy Disclosure",
    content: `FindOO collects, processes, and stores personal data in accordance with: (a) the Information Technology Act, 2000; (b) the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011; (c) the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; (d) the Digital Personal Data Protection Act, 2023; and (e) any rules notified by the Central Government under the DPDP Act. User data may be disclosed to: (a) regulatory authorities (SEBI, RBI, IRDAI, etc.) upon lawful request; (b) law enforcement agencies under valid legal process; (c) courts of competent jurisdiction as required by law; and (d) the Data Protection Board of India in connection with proceedings under the DPDP Act. For complete details on data handling, please refer to our Privacy Policy.`,
  },
  {
    title: "6. Third-Party Content Disclosure",
    content: `The Platform may display or link to content, products, services, regulatory filings, or information from third-party sources, including: (a) user-generated Content posted by registered Users; (b) regulatory data from SEBI, AMFI, RBI, IRDAI, PFRDA, and other government databases; (c) links to external websites, job portals, event platforms, and financial product pages; and (d) embedded content from news sources or industry publications. FindOO: (a) does not guarantee the accuracy, completeness, timeliness, or reliability of third-party content; (b) is not responsible for the content, privacy practices, or policies of linked third-party services; (c) does not endorse any third-party product, service, or opinion; and (d) is not a party to any transaction between Users or between a User and a third party.`,
  },
  {
    title: "7. Conflict of Interest Disclosure",
    content: `FindOO, its directors, officers, employees, and affiliates: (a) may personally hold investments in securities or financial instruments that may be discussed by Users on the Platform; (b) may have business relationships with entities whose products or services are listed or discussed on the Platform; (c) may earn revenue from premium features, advertising, or partnerships with financial services firms in the future. FindOO maintains internal policies to manage conflicts of interest, including: (a) information barriers between business functions; (b) prohibitions on using non-public User data for personal trading; and (c) disclosure obligations for employees who post financial Content on the Platform. Users should be aware of potential conflicts and make independent decisions.`,
  },
  {
    title: "8. Intermediary Status Disclosure",
    content: `FindOO operates as an intermediary under the Information Technology Act, 2000. As an intermediary: (a) FindOO exercises due diligence as prescribed under the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; (b) FindOO is not liable for any third-party Content hosted on the Platform, provided it acts in accordance with its obligations under the IT Act and applicable rules upon receiving actual knowledge or being notified by the appropriate government or its agency; (c) FindOO has appointed a Grievance Officer, a Chief Compliance Officer, and a Nodal Contact Person as required under the IT Rules; (d) FindOO publishes a monthly compliance report detailing complaints received, actions taken, and content moderation statistics. Users may access this report through the Platform's transparency page.`,
  },
  {
    title: "9. Accessibility & Language Disclosure",
    content: `FindOO's legal documents, including these Terms, Privacy Policy, and Disclosures, are drafted in English. In the event of any conflict between the English version and translations into other languages, the English version shall prevail. FindOO is committed to making the Platform accessible to all users and continuously works to improve accessibility in accordance with applicable guidelines.`,
  },
];

const contentMap: Record<string, { sections: typeof termsSections; lastUpdated: string }> = {
  Terms: { sections: termsSections, lastUpdated: "March 2026" },
  Privacy: { sections: privacySections, lastUpdated: "March 2026" },
  Policies: { sections: policiesSections, lastUpdated: "March 2026" },
  Disclosures: { sections: disclosureSections, lastUpdated: "March 2026" },
};

const Legal = () => {
  usePageMeta({ title: "Legal & Compliance", description: "FindOO terms of service, privacy policy, platform policies, and regulatory disclosures — Indian jurisdiction, DPDP Act compliant." });
  const [activeTab, setActiveTab] = useState("Terms");
  const { sections, lastUpdated } = contentMap[activeTab];

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Legal"
        title="Legal &"
        titleAccent="Compliance"
        subtitle="Our commitment to transparency, data protection, and regulatory compliance under Indian law."
        variant="dots"
      />

      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="legal-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="py-14">
        <div className="container max-w-3xl">
          <motion.p className="text-sm text-muted-foreground mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            Last updated: {lastUpdated}
          </motion.p>
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={`${activeTab}-${s.title}`} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <h2 className="text-lg font-bold font-heading text-foreground mb-2">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Legal;
