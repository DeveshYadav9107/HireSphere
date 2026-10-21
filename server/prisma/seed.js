const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HireSphere database seeding...');

  // 1. Hash default password
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 2. Clean existing data in order of relations
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.jobAlert.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.candidateEducation.deleteMany();
  await prisma.candidateExperience.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Users
  const candidateUser = await prisma.user.create({
    data: {
      email: 'candidate@hiresphere.com',
      passwordHash: defaultPassword,
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      role: 'CANDIDATE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      emailVerified: true,
      isActive: true,
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'recruiter@hiresphere.com',
      passwordHash: defaultPassword,
      name: 'Priya Nair',
      phone: '+91 91234 56789',
      role: 'RECRUITER',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      emailVerified: true,
      isActive: true,
    },
  });

  const recruiterUser2 = await prisma.user.create({
    data: {
      email: 'recruiter2@hiresphere.com',
      passwordHash: defaultPassword,
      name: 'Vikram Mehta',
      phone: '+91 99887 76655',
      role: 'RECRUITER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      emailVerified: true,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hiresphere.com',
      passwordHash: defaultPassword,
      name: 'HireSphere Administrator',
      phone: '+91 90000 00001',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      emailVerified: true,
      isActive: true,
    },
  });

  // 4. Candidate Profile
  const profile = await prisma.candidateProfile.create({
    data: {
      userId: candidateUser.id,
      headline: 'Senior Full Stack Engineer | React, Node.js, Next.js, Cloud Architectures',
      summary: 'Passionate software engineer with 5+ years of experience crafting resilient web platforms, microservices, and distributed applications. Skilled in modern JavaScript/TypeScript, cloud infrastructure, and agile delivery.',
      location: 'Bengaluru, Karnataka',
      currentSalary: 18.5,
      expectedSalary: 26.0,
      noticePeriod: '1 Month',
      preferredLocations: 'Bengaluru, Hyderabad, Remote',
      preferredRoles: 'Senior Software Engineer, Full Stack Lead, Tech Lead',
      profileCompletion: 85,
    },
  });

  // Candidate Skills
  await prisma.candidateSkill.createMany({
    data: [
      { candidateProfileId: profile.id, name: 'React.js', yearsOfExp: 5.0, proficiency: 'EXPERT' },
      { candidateProfileId: profile.id, name: 'Node.js', yearsOfExp: 4.5, proficiency: 'EXPERT' },
      { candidateProfileId: profile.id, name: 'TypeScript', yearsOfExp: 3.5, proficiency: 'INTERMEDIATE' },
      { candidateProfileId: profile.id, name: 'PostgreSQL', yearsOfExp: 4.0, proficiency: 'INTERMEDIATE' },
      { candidateProfileId: profile.id, name: 'Docker & AWS', yearsOfExp: 3.0, proficiency: 'INTERMEDIATE' },
    ],
  });

  // Candidate Experience
  await prisma.candidateExperience.createMany({
    data: [
      {
        candidateProfileId: profile.id,
        company: 'Innovatech Solutions',
        role: 'Senior Software Engineer',
        startDate: '2022-04',
        endDate: null,
        isCurrent: true,
        location: 'Bengaluru',
        description: 'Led architecture and development of customer-facing fintech dashboards serving 1.2M daily active users. Reduced bundle size by 40% and improved Core Web Vitals.',
      },
      {
        candidateProfileId: profile.id,
        company: 'NextGen Digital Labs',
        role: 'Full Stack Developer',
        startDate: '2019-07',
        endDate: '2022-03',
        isCurrent: false,
        location: 'Pune',
        description: 'Engineered REST and GraphQL microservices with Node.js and PostgreSQL. Collaborated across product, UI/UX and QA teams to ship quarterly feature milestones.',
      },
    ],
  });

  // Candidate Education
  await prisma.candidateEducation.createMany({
    data: [
      {
        candidateProfileId: profile.id,
        degree: 'Bachelor of Technology (B.Tech)',
        institution: 'National Institute of Technology (NIT)',
        fieldOfStudy: 'Computer Science and Engineering',
        graduationYear: 2019,
        score: '8.8 CGPA',
      },
    ],
  });

  // Candidate Resume
  const candidateResume = await prisma.resume.create({
    data: {
      userId: candidateUser.id,
      fileName: 'Rahul_Sharma_Resume_2026.pdf',
      originalName: 'Rahul_Sharma_Resume_2026.pdf',
      filePath: 'resumes/sample-resume.pdf',
      fileSize: 248500,
      mimeType: 'application/pdf',
      isDefault: true,
    },
  });

  // 5. Companies
  const companies = [
    {
      name: 'Razorpay',
      slug: 'razorpay',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&q=80',
      industry: 'Financial Technology',
      website: 'https://razorpay.com',
      location: 'Bengaluru, Karnataka',
      size: '2,000-5,000 Employees',
      description: 'Razorpay is India’s leading full-stack financial solutions company enabling payments, neo-banking, and business financing for millions of merchants.',
      foundedYear: 2014,
      rating: 4.6,
      reviewsCount: 1840,
    },
    {
      name: 'Microsoft India',
      slug: 'microsoft-india',
      logo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?auto=format&fit=crop&w=128&q=80',
      industry: 'Enterprise Software & Cloud',
      website: 'https://microsoft.com',
      location: 'Bengaluru & Hyderabad',
      size: '10,000+ Employees',
      description: 'Microsoft India operates world-class engineering, research, and cloud development centers driving Azure, Copilot, and intelligent cloud innovation globally.',
      foundedYear: 1990,
      rating: 4.7,
      reviewsCount: 5210,
    },
    {
      name: 'Google India',
      slug: 'google-india',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=128&q=80',
      industry: 'Internet & Artificial Intelligence',
      website: 'https://google.com',
      location: 'Bengaluru & Hyderabad',
      size: '10,000+ Employees',
      description: 'Google’s mission is to organize the world’s information and make it universally accessible and useful through cutting-edge AI, Search, and Android platforms.',
      foundedYear: 2004,
      rating: 4.8,
      reviewsCount: 8400,
    },
    {
      name: 'Tata Consultancy Services',
      slug: 'tcs',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=128&q=80',
      industry: 'IT Services & Consulting',
      website: 'https://tcs.com',
      location: 'Mumbai, Pune & PAN India',
      size: '100,000+ Employees',
      description: 'A purpose-led organization that brings together the best technology, consulting, and digital engineering services to world leaders across 50+ countries.',
      foundedYear: 1968,
      rating: 4.1,
      reviewsCount: 24500,
    },
    {
      name: 'Flipkart',
      slug: 'flipkart',
      logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=128&q=80',
      industry: 'E-commerce & Supply Chain',
      website: 'https://flipkart.com',
      location: 'Bengaluru, Karnataka',
      size: '10,000+ Employees',
      description: 'Flipkart is one of India’s premier digital commerce platforms with over 450 million registered customers and cutting-edge logistics infrastructure.',
      foundedYear: 2007,
      rating: 4.3,
      reviewsCount: 6100,
    },
    {
      name: 'Zerodha',
      slug: 'zerodha',
      logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=128&q=80',
      industry: 'Fintech & Capital Markets',
      website: 'https://zerodha.com',
      location: 'Bengaluru, Karnataka',
      size: '1,000-2,000 Employees',
      description: 'India’s largest stockbroker and bootstrapping success story, empowering over 10+ million traders through lightning-fast technology and zero-brokerage models.',
      foundedYear: 2010,
      rating: 4.8,
      reviewsCount: 920,
    },
    {
      name: 'Swiggy',
      slug: 'swiggy',
      logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=128&q=80',
      industry: 'On-demand Delivery & Tech',
      website: 'https://swiggy.com',
      location: 'Bengaluru, Karnataka',
      size: '5,000-10,000 Employees',
      description: 'Pioneering convenience platform powering food delivery, Instamart quick grocery, and dining reservations with ultra-low latency logistical systems.',
      foundedYear: 2014,
      rating: 4.2,
      reviewsCount: 3800,
    },
    {
      name: 'Zomato',
      slug: 'zomato',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=128&q=80',
      industry: 'Food & Quick Commerce',
      website: 'https://zomato.com',
      location: 'Gurugram, Haryana',
      size: '5,000-10,000 Employees',
      description: 'Empowering better food for more people with instant grocery, dining discovery, and hyper-local supply chains across India.',
      foundedYear: 2008,
      rating: 4.3,
      reviewsCount: 4200,
    },
  ];

  const createdCompanies = {};
  for (const c of companies) {
    const record = await prisma.company.create({ data: c });
    createdCompanies[c.slug] = record;
  }

  // 6. Realistic Jobs across roles, experience and departments
  const sampleJobs = [
    {
      recruiterId: recruiterUser.id,
      companyId: createdCompanies['razorpay'].id,
      title: 'Senior Full Stack Engineer (React & Node.js)',
      slug: 'senior-full-stack-engineer-razorpay',
      department: 'Software Engineering',
      workMode: 'Hybrid',
      location: 'Bengaluru',
      minExp: 4,
      maxExp: 8,
      minSalary: 22.0,
      maxSalary: 35.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 3,
      description: `### Role Overview
Razorpay is seeking an experienced Senior Full Stack Engineer to build high-scale financial software, payment gateway orchestration systems, and merchant onboarding workflows.

### Key Responsibilities:
- Design, build, and maintain efficient, reusable, and reliable front-end and back-end code.
- Architect scalable Node.js microservices handling 10,000+ queries per second.
- Collaborate with Product Managers, UX Designers, and Security Auditors.
- Mentor junior engineers and champion automated testing and CI/CD pipelines.

### Requirements:
- 4+ years of production experience in JavaScript / TypeScript, React.js, and Node.js.
- Strong fundamentals in relational databases (PostgreSQL/MySQL) and caching (Redis).
- Hands-on experience with cloud providers (AWS, GCP) and containerization (Docker, Kubernetes).`,
      requirements: '4+ years of relevant experience, B.Tech/M.Tech in CS or equivalent.',
      benefits: 'Competitive equity, comprehensive health insurance, annual learning stipend, flexible hybrid work policy.',
      status: 'ACTIVE',
      skills: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'AWS'],
    },
    {
      recruiterId: recruiterUser.id,
      companyId: createdCompanies['razorpay'].id,
      title: 'Lead Product Designer (UI / UX)',
      slug: 'lead-product-designer-razorpay',
      department: 'Design',
      workMode: 'Hybrid',
      location: 'Bengaluru',
      minExp: 5,
      maxExp: 9,
      minSalary: 28.0,
      maxSalary: 42.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 1,
      description: `### About the Role
You will own the end-to-end design strategy for Razorpay Capital and merchant financial operating systems, creating intuitive dashboards for business owners.

### Key Responsibilities:
- Translate complex financial workflows into simple, elegant user journeys.
- Maintain and expand Razorpay's Blade Design System in Figma.
- Conduct user research, usability testing, and prototype validation.`,
      requirements: 'Strong portfolio demonstrating B2B SaaS or fintech product design expertise.',
      benefits: 'Gym membership, wellness days, latest MacBook Pro, health coverage for family.',
      status: 'ACTIVE',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
    },
    {
      recruiterId: recruiterUser2.id,
      companyId: createdCompanies['microsoft-india'].id,
      title: 'Cloud Solutions Architect - Azure AI',
      slug: 'cloud-solutions-architect-microsoft',
      department: 'Cloud & AI',
      workMode: 'Remote',
      location: 'Remote',
      minExp: 6,
      maxExp: 12,
      minSalary: 35.0,
      maxSalary: 55.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 2,
      description: `### About Microsoft Azure
Join Microsoft's Global Customer Success team to partner with enterprise clients in deploying mission-critical AI workloads, OpenAI services, and high-performance computing clusters on Azure.

### Key Responsibilities:
- Serve as the technical authority on Azure OpenAI, Cognitive Services, and vector search.
- Architect fault-tolerant infrastructure and cloud security baselines.
- Present architectural blueprints to Fortune 500 CTOs and VPs of Engineering.`,
      requirements: 'Azure Solution Architect certification or equivalent hands-on cloud depth.',
      benefits: 'Microsoft stock grants (ESPP), remote work allowance, childcare benefits, world-class parental leave.',
      status: 'ACTIVE',
      skills: ['Azure', 'Generative AI', 'Cloud Architecture', 'Python', 'Kubernetes'],
    },
    {
      recruiterId: recruiterUser2.id,
      companyId: createdCompanies['google-india'].id,
      title: 'Software Engineer III - Distributed Systems',
      slug: 'software-engineer-google-india',
      department: 'Software Engineering',
      workMode: 'Hybrid',
      location: 'Hyderabad',
      minExp: 3,
      maxExp: 7,
      minSalary: 30.0,
      maxSalary: 50.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 4,
      description: `### Overview
Google’s core infrastructure powers Search, YouTube, and Maps. We are looking for talented engineers who thrive in distributed storage, concurrency, and large-scale algorithms.

### Key Responsibilities:
- Develop scalable distributed systems and backend services in Go, C++, or Java.
- Optimize multi-datacenter query latency and fault tolerance.
- Drive reliability metrics and observability frameworks.`,
      requirements: 'Solid data structures, algorithms, and concurrency fundamentals.',
      benefits: 'Free gourmet meals, comprehensive insurance, 401k/EPF match, Google bonus programs.',
      status: 'ACTIVE',
      skills: ['Go', 'C++', 'Distributed Systems', 'Data Structures', 'Linux', 'Microservices'],
    },
    {
      recruiterId: recruiterUser2.id,
      companyId: createdCompanies['tcs'].id,
      title: 'Associate Software Developer (Freshers 2025/2026)',
      slug: 'associate-developer-fresher-tcs',
      department: 'Software Engineering',
      workMode: 'On-site',
      location: 'Pune',
      minExp: 0,
      maxExp: 1,
      minSalary: 4.5,
      maxSalary: 7.2,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 25,
      description: `### Fresher Onboarding Program
Join India’s premier IT powerhouse through our coveted digital engineering accelerator program. Comprehensive 3-month paid training in full stack development, cloud, and modern DevOps.

### Qualifications:
- B.E. / B.Tech / MCA in CS, IT, ECE or related engineering disciplines.
- 60% or 6.5 CGPA throughout 10th, 12th, and Graduation.
- Foundational understanding of Java, Python, or JavaScript and SQL basics.`,
      requirements: 'Good communication skills, analytical mindset, willingness to relocate to Pune/Mumbai.',
      benefits: 'Medical insurance, corporate discounts, continuous TCS iON certifications.',
      status: 'ACTIVE',
      skills: ['Java', 'SQL', 'HTML/CSS', 'JavaScript', 'Problem Solving'],
    },
    {
      recruiterId: recruiterUser.id,
      companyId: createdCompanies['flipkart'].id,
      title: 'Senior Data Scientist - Supply Chain & Logistics',
      slug: 'senior-data-scientist-flipkart',
      department: 'Data & Analytics',
      workMode: 'Hybrid',
      location: 'Bengaluru',
      minExp: 4,
      maxExp: 8,
      minSalary: 26.0,
      maxSalary: 40.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 2,
      description: `### About the Team
Flipkart Ekart delivers millions of packages every day. Our Data Science team develops optimization engines for route planning, warehouse allocation, and demand forecasting.

### Key Responsibilities:
- Develop predictive models utilizing machine learning and deep learning algorithms.
- Deploy real-time ML pipelines using PyTorch, MLflow, and Kubernetes.
- Collaborate with operations leaders to translate data insights into operational efficiency.`,
      requirements: 'Master’s or Ph.D. in Computer Science, Statistics, Mathematics or equivalent.',
      benefits: 'Transport shuttle service, medical insurance for parents, annual performance bonus.',
      status: 'ACTIVE',
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'SQL', 'MLOps'],
    },
    {
      recruiterId: recruiterUser.id,
      companyId: createdCompanies['zerodha'].id,
      title: 'Frontend Engineer (React / Web Performance)',
      slug: 'frontend-engineer-zerodha',
      department: 'Software Engineering',
      workMode: 'Remote',
      location: 'Remote',
      minExp: 2,
      maxExp: 5,
      minSalary: 16.0,
      maxSalary: 28.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 2,
      description: `### About Kite
Zerodha's flagship trading platform Kite processes billions in volume daily. We care obsessively about milliseconds, zero unnecessary dependencies, and accessible UI.

### Responsibilities:
- Build blazing fast web interfaces using vanilla JavaScript, React, and Canvas/WebGL charts.
- Maintain 60fps streaming ticker data over WebSockets under heavy market volatility.
- Write clean, maintainable, dependency-light code.`,
      requirements: 'Deep mastery of JavaScript, browser rendering pipeline, and DOM performance.',
      benefits: 'Fully remote, generous profit sharing bonus, zero micromanagement, top hardware of choice.',
      status: 'ACTIVE',
      skills: ['React.js', 'JavaScript', 'WebSockets', 'Canvas API', 'CSS Architecture'],
    },
    {
      recruiterId: recruiterUser.id,
      companyId: createdCompanies['swiggy'].id,
      title: 'Backend Engineer - Delivery & Dispatch Engine',
      slug: 'backend-engineer-swiggy',
      department: 'Software Engineering',
      workMode: 'Hybrid',
      location: 'Bengaluru',
      minExp: 3,
      maxExp: 6,
      minSalary: 20.0,
      maxSalary: 32.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 3,
      description: `### About the Team
The Dispatch team at Swiggy solves real-time vehicle routing and batched dispatch algorithms, ensuring orders reach hunger-driven customers in 15-20 minutes.

### Responsibilities:
- Develop high-throughput Golang and Java services processing geo-spatial queries.
- Build resilient message streaming with Apache Kafka and RabbitMQ.
- Scale Postgres and Redis caches for heavy concurrent writes.`,
      requirements: 'Experience in distributed caching, message queues, and high-volume backend architectures.',
      benefits: 'Swiggy One corporate subscription, meal subsidies, comprehensive healthcare.',
      status: 'ACTIVE',
      skills: ['Go', 'Java', 'Kafka', 'PostgreSQL', 'Redis', 'Docker'],
    },
    {
      recruiterId: recruiterUser2.id,
      companyId: createdCompanies['zomato'].id,
      title: 'Senior Product Manager - Quick Commerce Growth',
      slug: 'senior-product-manager-zomato',
      department: 'Product Management',
      workMode: 'On-site',
      location: 'Gurugram',
      minExp: 5,
      maxExp: 9,
      minSalary: 32.0,
      maxSalary: 48.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 1,
      description: `### Role Overview
Lead cross-functional squads to drive discovery, user retention, and checkout funnel optimization for millions of weekly quick-commerce orders across 30+ metro cities.

### Responsibilities:
- Define vision, roadmap, and OKRs for user acquisition and repeat conversion.
- Partner with Engineering, Design, Analytics, and Merchandising teams.
- Run multivariate A/B testing and interpret cohorts to optimize customer LTV.`,
      requirements: 'Proven track record of managing high-growth consumer apps with millions of MAUs.',
      benefits: 'Stock incentives (ESOPs), executive wellness plan, onsite cafeteria, cab reimbursement.',
      status: 'ACTIVE',
      skills: ['Product Strategy', 'Growth Marketing', 'A/B Testing', 'SQL', 'Data Analytics'],
    },
    {
      recruiterId: recruiterUser2.id,
      companyId: createdCompanies['microsoft-india'].id,
      title: 'DevOps & Site Reliability Engineer (SRE)',
      slug: 'devops-sre-microsoft',
      department: 'DevOps & Infrastructure',
      workMode: 'Hybrid',
      location: 'Noida',
      minExp: 3,
      maxExp: 7,
      minSalary: 18.0,
      maxSalary: 30.0,
      salaryCurrency: 'INR',
      employmentType: 'Full Time',
      openings: 2,
      description: `### Team Mission
Ensure 99.999% availability for Microsoft enterprise services. You will automate deployment pipelines, incident remediation, and multi-region failovers.

### Responsibilities:
- Implement Infrastructure as Code (IaC) with Terraform, Bicep, and Ansible.
- Manage large-scale Kubernetes (AKS) clusters and CI/CD GitHub Actions.
- Build monitoring dashboards and SLIs/SLOs in Prometheus and Grafana.`,
      requirements: '3+ years SRE or DevOps experience with Kubernetes and Linux systems.',
      benefits: 'Stock grants, health insurance, remote working options, education assistance.',
      status: 'ACTIVE',
      skills: ['Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Prometheus', 'Linux'],
    },
  ];

  const createdJobs = [];
  for (const j of sampleJobs) {
    const { skills, ...jobData } = j;
    const job = await prisma.job.create({
      data: {
        ...jobData,
        skills: {
          create: skills.map((s) => ({ skill: s })),
        },
      },
    });
    createdJobs.push(job);
  }

  // 7. Sample Candidate Applications
  const app1 = await prisma.jobApplication.create({
    data: {
      jobId: createdJobs[0].id, // Razorpay Senior Full Stack
      candidateId: candidateUser.id,
      resumeId: candidateResume.id,
      coverNote: 'Excited about Razorpay’s payments mission! With 5 years of React and Node.js experience, I’m confident I can make an immediate impact.',
      currentCtc: 18.5,
      expectedCtc: 26.0,
      noticePeriod: '1 Month',
      status: 'SHORTLISTED',
    },
  });

  const app2 = await prisma.jobApplication.create({
    data: {
      jobId: createdJobs[6].id, // Zerodha Frontend
      candidateId: candidateUser.id,
      resumeId: candidateResume.id,
      coverNote: 'Huge admirer of Zerodha’s tech ethos and low-latency philosophy. Looking forward to discussing how I can contribute to Kite.',
      currentCtc: 18.5,
      expectedCtc: 25.0,
      noticePeriod: 'Immediate',
      status: 'APPLIED',
    },
  });

  // 8. Saved Jobs
  await prisma.savedJob.create({
    data: {
      candidateId: candidateUser.id,
      jobId: createdJobs[2].id, // Microsoft Azure AI
    },
  });

  await prisma.savedJob.create({
    data: {
      candidateId: candidateUser.id,
      jobId: createdJobs[3].id, // Google Distributed Systems
    },
  });

  // 9. Job Alerts
  await prisma.jobAlert.create({
    data: {
      candidateId: candidateUser.id,
      title: 'Full Stack & Frontend in Bengaluru',
      keywords: 'React, Node.js, Next.js',
      location: 'Bengaluru',
      minSalary: 20.0,
      maxExp: 6,
      frequency: 'DAILY',
      isActive: true,
    },
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: candidateUser.id,
        title: 'Application Shortlisted!',
        message: 'Congratulations! Razorpay has shortlisted your application for Senior Full Stack Engineer (React & Node.js).',
        type: 'STATUS_CHANGE',
        isRead: false,
        link: '/candidate/dashboard?tab=applications',
      },
      {
        userId: candidateUser.id,
        title: 'New Matching Job Alert',
        message: 'Microsoft India posted a new job matching your preferences: Cloud Solutions Architect - Azure AI.',
        type: 'ALERT',
        isRead: true,
        link: `/jobs/${createdJobs[2].id}`,
      },
      {
        userId: recruiterUser.id,
        title: 'New Application Received',
        message: 'Rahul Sharma applied for Senior Full Stack Engineer (React & Node.js).',
        type: 'APPLICATION',
        isRead: false,
        link: '/recruiter/dashboard?tab=applicants',
      },
    ],
  });

  // 11. Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: 'PLATFORM_INITIALIZATION',
      targetType: 'SYSTEM',
      targetId: 'INIT-001',
      details: 'Initial system seed and baseline dataset created successfully.',
    },
  });

  console.log('✅ HireSphere database seeded successfully!');
  console.log('--------------------------------------------------');
  console.log('Candidate Account: candidate@hiresphere.com  / Password123!');
  console.log('Recruiter Account: recruiter@hiresphere.com  / Password123!');
  console.log('Recruiter 2:       recruiter2@hiresphere.com / Password123!');
  console.log('Admin Account:     admin@hiresphere.com      / Password123!');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
