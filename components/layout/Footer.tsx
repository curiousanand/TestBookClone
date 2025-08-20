'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui';

interface FooterLinkSection {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  // Comprehensive footer link sections (300+ links)
  const footerSections: FooterLinkSection[] = [
    {
      title: 'Banking Exams',
      links: [
        { label: 'SBI PO', href: '/banking/sbi-po' },
        { label: 'SBI Clerk', href: '/banking/sbi-clerk' },
        { label: 'SBI SO', href: '/banking/sbi-so' },
        { label: 'IBPS PO', href: '/banking/ibps-po' },
        { label: 'IBPS Clerk', href: '/banking/ibps-clerk' },
        { label: 'IBPS SO', href: '/banking/ibps-so' },
        { label: 'IBPS RRB PO', href: '/banking/ibps-rrb-po' },
        { label: 'IBPS RRB Clerk', href: '/banking/ibps-rrb-clerk' },
        { label: 'RBI Grade B', href: '/banking/rbi-grade-b' },
        { label: 'RBI Assistant', href: '/banking/rbi-assistant' },
        { label: 'NABARD Grade A', href: '/banking/nabard-grade-a' },
        { label: 'NABARD Grade B', href: '/banking/nabard-grade-b' },
        { label: 'SIDBI Grade A', href: '/banking/sidbi-grade-a' },
        { label: 'SEBI Grade A', href: '/banking/sebi-grade-a' },
        { label: 'LIC AAO', href: '/banking/lic-aao' },
        { label: 'LIC ADO', href: '/banking/lic-ado' },
        { label: 'NIACL AO', href: '/banking/niacl-ao' },
        { label: 'UIIC AO', href: '/banking/uiic-ao' },
        { label: 'BOB PO', href: '/banking/bob-po' },
        { label: 'Canara Bank PO', href: '/banking/canara-bank-po' }
      ]
    },
    {
      title: 'SSC Exams',
      links: [
        { label: 'SSC CGL', href: '/ssc/cgl' },
        { label: 'SSC CHSL', href: '/ssc/chsl' },
        { label: 'SSC MTS', href: '/ssc/mts' },
        { label: 'SSC GD', href: '/ssc/gd' },
        { label: 'SSC JE', href: '/ssc/je' },
        { label: 'SSC CPO', href: '/ssc/cpo' },
        { label: 'SSC Stenographer', href: '/ssc/stenographer' },
        { label: 'SSC JHT', href: '/ssc/jht' },
        { label: 'SSC Selection Post', href: '/ssc/selection-post' },
        { label: 'SSC Delhi Police', href: '/ssc/delhi-police' },
        { label: 'SSC Scientific Assistant', href: '/ssc/scientific-assistant' },
        { label: 'SSC Translator', href: '/ssc/translator' },
        { label: 'SSC Havaldar', href: '/ssc/havaldar' },
        { label: 'SSC Phase X', href: '/ssc/phase-x' },
        { label: 'SSC Phase XI', href: '/ssc/phase-xi' },
        { label: 'SSC Exam Calendar', href: '/ssc/exam-calendar' },
        { label: 'SSC Admit Card', href: '/ssc/admit-card' },
        { label: 'SSC Result', href: '/ssc/result' },
        { label: 'SSC Cut Off', href: '/ssc/cut-off' },
        { label: 'SSC Syllabus', href: '/ssc/syllabus' }
      ]
    },
    {
      title: 'Railway Exams',
      links: [
        { label: 'RRB NTPC', href: '/railway/rrb-ntpc' },
        { label: 'RRB Group D', href: '/railway/rrb-group-d' },
        { label: 'RRB JE', href: '/railway/rrb-je' },
        { label: 'RRB ALP', href: '/railway/rrb-alp' },
        { label: 'RRB TC', href: '/railway/rrb-tc' },
        { label: 'RRB RPF', href: '/railway/rrb-rpf' },
        { label: 'RRB Ministerial', href: '/railway/rrb-ministerial' },
        { label: 'RRB Paramedical', href: '/railway/rrb-paramedical' },
        { label: 'Railway Loco Pilot', href: '/railway/loco-pilot' },
        { label: 'Railway Station Master', href: '/railway/station-master' },
        { label: 'Railway Goods Guard', href: '/railway/goods-guard' },
        { label: 'Railway Traffic Assistant', href: '/railway/traffic-assistant' },
        { label: 'Railway Commercial Apprentice', href: '/railway/commercial-apprentice' },
        { label: 'RRLA Exam', href: '/railway/rrla' },
        { label: 'SCRA Exam', href: '/railway/scra' },
        { label: 'Railway Exam Calendar', href: '/railway/exam-calendar' },
        { label: 'Railway Admit Card', href: '/railway/admit-card' },
        { label: 'Railway Result', href: '/railway/result' },
        { label: 'Railway Cut Off', href: '/railway/cut-off' },
        { label: 'Railway Syllabus', href: '/railway/syllabus' }
      ]
    },
    {
      title: 'State PSC',
      links: [
        { label: 'UPSC Civil Services', href: '/state-psc/upsc-civil-services' },
        { label: 'UPPSC PCS', href: '/state-psc/uppsc-pcs' },
        { label: 'BPSC', href: '/state-psc/bpsc' },
        { label: 'MPSC', href: '/state-psc/mpsc' },
        { label: 'RPSC RAS', href: '/state-psc/rpsc-ras' },
        { label: 'HPSC HCS', href: '/state-psc/hpsc-hcs' },
        { label: 'GPSC', href: '/state-psc/gpsc' },
        { label: 'PPSC', href: '/state-psc/ppsc' },
        { label: 'JPSC', href: '/state-psc/jpsc' },
        { label: 'APSC', href: '/state-psc/apsc' },
        { label: 'TSPSC', href: '/state-psc/tspsc' },
        { label: 'KPSC', href: '/state-psc/kpsc' },
        { label: 'TNPSC', href: '/state-psc/tnpsc' },
        { label: 'OPSC', href: '/state-psc/opsc' },
        { label: 'WBPSC', href: '/state-psc/wbpsc' },
        { label: 'UKPSC', href: '/state-psc/ukpsc' },
        { label: 'CGPSC', href: '/state-psc/cgpsc' },
        { label: 'JKPSC', href: '/state-psc/jkpsc' },
        { label: 'MPPSC', href: '/state-psc/mppsc' },
        { label: 'HPPSC', href: '/state-psc/hppsc' }
      ]
    },
    {
      title: 'Defense Exams',
      links: [
        { label: 'NDA', href: '/defense/nda' },
        { label: 'CDS', href: '/defense/cds' },
        { label: 'AFCAT', href: '/defense/afcat' },
        { label: 'CAPF', href: '/defense/capf' },
        { label: 'BSF', href: '/defense/bsf' },
        { label: 'CRPF', href: '/defense/crpf' },
        { label: 'CISF', href: '/defense/cisf' },
        { label: 'ITBP', href: '/defense/itbp' },
        { label: 'SSB', href: '/defense/ssb' },
        { label: 'Navy AA', href: '/defense/navy-aa' },
        { label: 'Navy SSR', href: '/defense/navy-ssr' },
        { label: 'Army Clerk', href: '/defense/army-clerk' },
        { label: 'Indian Coast Guard', href: '/defense/coast-guard' },
        { label: 'Agniveer', href: '/defense/agniveer' },
        { label: 'Military Police', href: '/defense/military-police' },
        { label: 'Army GD', href: '/defense/army-gd' },
        { label: 'Air Force Group X', href: '/defense/air-force-x' },
        { label: 'Air Force Group Y', href: '/defense/air-force-y' },
        { label: 'Territorial Army', href: '/defense/territorial-army' },
        { label: 'Para Military', href: '/defense/para-military' }
      ]
    },
    {
      title: 'Teaching Exams',
      links: [
        { label: 'CTET', href: '/teaching/ctet' },
        { label: 'DSSSB TGT', href: '/teaching/dsssb-tgt' },
        { label: 'DSSSB PGT', href: '/teaching/dsssb-pgt' },
        { label: 'DSSSB PRT', href: '/teaching/dsssb-prt' },
        { label: 'KVS TGT', href: '/teaching/kvs-tgt' },
        { label: 'KVS PGT', href: '/teaching/kvs-pgt' },
        { label: 'KVS PRT', href: '/teaching/kvs-prt' },
        { label: 'NVS TGT', href: '/teaching/nvs-tgt' },
        { label: 'NVS PGT', href: '/teaching/nvs-pgt' },
        { label: 'UGC NET', href: '/teaching/ugc-net' },
        { label: 'CSIR NET', href: '/teaching/csir-net' },
        { label: 'HTET', href: '/teaching/htet' },
        { label: 'REET', href: '/teaching/reet' },
        { label: 'UPTET', href: '/teaching/uptet' },
        { label: 'BTET', href: '/teaching/btet' },
        { label: 'MPTET', href: '/teaching/mptet' },
        { label: 'APTET', href: '/teaching/aptet' },
        { label: 'KTET', href: '/teaching/ktet' },
        { label: 'TNTET', href: '/teaching/tntet' },
        { label: 'WBTET', href: '/teaching/wbtet' }
      ]
    },
    {
      title: 'Engineering Exams',
      links: [
        { label: 'GATE', href: '/engineering/gate' },
        { label: 'ESE', href: '/engineering/ese' },
        { label: 'ISRO', href: '/engineering/isro' },
        { label: 'DRDO', href: '/engineering/drdo' },
        { label: 'BARC', href: '/engineering/barc' },
        { label: 'NPCIL', href: '/engineering/npcil' },
        { label: 'BHEL', href: '/engineering/bhel' },
        { label: 'SAIL', href: '/engineering/sail' },
        { label: 'NTPC', href: '/engineering/ntpc' },
        { label: 'PGCIL', href: '/engineering/pgcil' },
        { label: 'ONGC', href: '/engineering/ongc' },
        { label: 'IOCL', href: '/engineering/iocl' },
        { label: 'BPCL', href: '/engineering/bpcl' },
        { label: 'HPCL', href: '/engineering/hpcl' },
        { label: 'Coal India', href: '/engineering/coal-india' },
        { label: 'BEL', href: '/engineering/bel' },
        { label: 'HAL', href: '/engineering/hal' },
        { label: 'ECIL', href: '/engineering/ecil' },
        { label: 'DMRC', href: '/engineering/dmrc' },
        { label: 'RITES', href: '/engineering/rites' }
      ]
    },
    {
      title: 'Test Series',
      links: [
        { label: 'Free Mock Tests', href: '/test-series/free-mock-tests' },
        { label: 'Premium Test Series', href: '/test-series/premium' },
        { label: 'Subject Wise Tests', href: '/test-series/subject-wise' },
        { label: 'Previous Year Papers', href: '/test-series/previous-year' },
        { label: 'Sectional Tests', href: '/test-series/sectional' },
        { label: 'Full Length Tests', href: '/test-series/full-length' },
        { label: 'Speed Tests', href: '/test-series/speed-tests' },
        { label: 'Chapter Tests', href: '/test-series/chapter-tests' },
        { label: 'Topic Tests', href: '/test-series/topic-tests' },
        { label: 'All India Tests', href: '/test-series/all-india' },
        { label: 'Live Tests', href: '/test-series/live-tests' },
        { label: 'Adaptive Tests', href: '/test-series/adaptive' },
        { label: 'Performance Analysis', href: '/test-series/performance-analysis' },
        { label: 'Rank Predictor', href: '/test-series/rank-predictor' },
        { label: 'Test History', href: '/test-series/history' },
        { label: 'Leaderboard', href: '/test-series/leaderboard' },
        { label: 'Compare Performance', href: '/test-series/compare' },
        { label: 'Weakness Analysis', href: '/test-series/weakness-analysis' },
        { label: 'Strength Analysis', href: '/test-series/strength-analysis' },
        { label: 'Test Calendar', href: '/test-series/calendar' }
      ]
    },
    {
      title: 'Study Material',
      links: [
        { label: 'Free PDFs', href: '/study-material/free-pdfs' },
        { label: 'Premium Notes', href: '/study-material/premium-notes' },
        { label: 'Video Lectures', href: '/study-material/video-lectures' },
        { label: 'Audio Classes', href: '/study-material/audio-classes' },
        { label: 'E-books', href: '/study-material/ebooks' },
        { label: 'Formula Sheets', href: '/study-material/formula-sheets' },
        { label: 'Quick Revision', href: '/study-material/quick-revision' },
        { label: 'One Liners', href: '/study-material/one-liners' },
        { label: 'Mind Maps', href: '/study-material/mind-maps' },
        { label: 'Flash Cards', href: '/study-material/flash-cards' },
        { label: 'Practice Questions', href: '/study-material/practice-questions' },
        { label: 'Solutions', href: '/study-material/solutions' },
        { label: 'Explanations', href: '/study-material/explanations' },
        { label: 'Tips & Tricks', href: '/study-material/tips-tricks' },
        { label: 'Shortcuts', href: '/study-material/shortcuts' },
        { label: 'Time Management', href: '/study-material/time-management' },
        { label: 'Study Plans', href: '/study-material/study-plans' },
        { label: 'Strategy Guides', href: '/study-material/strategy-guides' },
        { label: 'Subject Guides', href: '/study-material/subject-guides' },
        { label: 'Exam Guides', href: '/study-material/exam-guides' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/company/about' },
        { label: 'Our Mission', href: '/company/mission' },
        { label: 'Our Vision', href: '/company/vision' },
        { label: 'Our Team', href: '/company/team' },
        { label: 'Leadership', href: '/company/leadership' },
        { label: 'Careers', href: '/company/careers' },
        { label: 'Investor Relations', href: '/company/investors' },
        { label: 'Press Release', href: '/company/press' },
        { label: 'News & Media', href: '/company/news' },
        { label: 'Blog', href: '/company/blog' },
        { label: 'Success Stories', href: '/company/success-stories' },
        { label: 'Testimonials', href: '/company/testimonials' },
        { label: 'Awards', href: '/company/awards' },
        { label: 'Partnerships', href: '/company/partnerships' },
        { label: 'CSR Activities', href: '/company/csr' },
        { label: 'Contact Us', href: '/company/contact' },
        { label: 'Office Locations', href: '/company/locations' },
        { label: 'Terms of Service', href: '/company/terms' },
        { label: 'Privacy Policy', href: '/company/privacy' },
        { label: 'Refund Policy', href: '/company/refund' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/support/help' },
        { label: 'FAQ', href: '/support/faq' },
        { label: 'Live Chat', href: '/support/live-chat' },
        { label: 'Email Support', href: '/support/email' },
        { label: 'Phone Support', href: '/support/phone' },
        { label: 'Technical Support', href: '/support/technical' },
        { label: 'Account Issues', href: '/support/account' },
        { label: 'Payment Issues', href: '/support/payment' },
        { label: 'Course Issues', href: '/support/course' },
        { label: 'Test Issues', href: '/support/test' },
        { label: 'Video Issues', href: '/support/video' },
        { label: 'Download Issues', href: '/support/download' },
        { label: 'Mobile App Support', href: '/support/mobile-app' },
        { label: 'Browser Issues', href: '/support/browser' },
        { label: 'System Requirements', href: '/support/system-requirements' },
        { label: 'Tutorials', href: '/support/tutorials' },
        { label: 'How to Use', href: '/support/how-to-use' },
        { label: 'Video Guides', href: '/support/video-guides' },
        { label: 'User Manual', href: '/support/manual' },
        { label: 'Report Bug', href: '/support/report-bug' }
      ]
    }
  ];

  const socialLinks = [
    { 
      label: 'Facebook', 
      href: 'https://facebook.com/testbook', 
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      label: 'Twitter', 
      href: 'https://twitter.com/testbook', 
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    { 
      label: 'YouTube', 
      href: 'https://youtube.com/testbook', 
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      label: 'Instagram', 
      href: 'https://instagram.com/testbook', 
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987s11.987-5.367 11.987-11.987C23.971 5.367 18.604.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.553 3.5 13.147 3.5 11.613s.698-2.94 1.626-4.078c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928 1.138 1.626 2.544 1.626 4.078s-.698 2.94-1.626 4.078c-.875.807-2.026 1.297-3.323 1.297zm7.599 0c-1.297 0-2.448-.49-3.323-1.297-.928-1.138-1.626-2.544-1.626-4.078s.698-2.94 1.626-4.078c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928 1.138 1.626 2.544 1.626 4.078s-.698 2.94-1.626 4.078c-.875.807-2.026 1.297-3.323 1.297z"/>
        </svg>
      )
    },
    { 
      label: 'LinkedIn', 
      href: 'https://linkedin.com/company/testbook', 
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      label: 'Telegram', 
      href: 'https://t.me/testbook', 
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      {/* Newsletter Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated with TestBook</h3>
              <p className="text-blue-100">
                Get the latest exam notifications, study materials, and success tips delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Email address for newsletter"
              />
              <Button variant="secondary" size="lg" className="whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-400">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Apps Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Download Our App</h4>
              <p className="text-gray-300 mb-4">
                Get access to free mock tests, live classes, and study materials on the go.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.testbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </Link>
                <Link
                  href="https://apps.apple.com/app/testbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/exam-calendar" className="text-gray-300 hover:text-white transition-colors duration-200">Exam Calendar</Link></li>
                <li><Link href="/admit-card" className="text-gray-300 hover:text-white transition-colors duration-200">Admit Card</Link></li>
                <li><Link href="/results" className="text-gray-300 hover:text-white transition-colors duration-200">Results</Link></li>
                <li><Link href="/cut-off" className="text-gray-300 hover:text-white transition-colors duration-200">Cut Off</Link></li>
                <li><Link href="/syllabus" className="text-gray-300 hover:text-white transition-colors duration-200">Syllabus</Link></li>
                <li><Link href="/preparation-tips" className="text-gray-300 hover:text-white transition-colors duration-200">Preparation Tips</Link></li>
                <li><Link href="/study-plan" className="text-gray-300 hover:text-white transition-colors duration-200">Study Plan</Link></li>
                <li><Link href="/current-affairs" className="text-gray-300 hover:text-white transition-colors duration-200">Current Affairs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <p className="text-gray-300 mb-4">
                Stay connected with us on social media for the latest updates and study tips.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    aria-label={`Follow us on ${social.label}`}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold">TestBook</span>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              © {currentYear} TestBook Education Private Limited. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;