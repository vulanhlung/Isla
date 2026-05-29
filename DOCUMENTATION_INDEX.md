# 📚 ISLA Documentation Index

Welcome to ISLA Mental Wellness Application! This file helps you navigate all documentation.

---

## 🚀 Getting Started (Choose Your Path)

### ⏱️ 5-Minute Setup (I'm in a hurry!)
→ Start with: **QUICKSTART.md**

### 📖 Complete Setup (I want full details)
→ Start with: **SETUP_GUIDE.md**

### 🔌 Understanding API (I want to integrate/extend)
→ Start with: **INTEGRATION_GUIDE.md**

### 🎨 Learning the UI (I want to understand pages)
→ Start with: **PAGES_DOCUMENTATION.md**

### 🆘 Something's Broken (I need help!)
→ Start with: **TROUBLESHOOTING.md**

---

## 📑 All Documentation Files

### Root Level Documentation

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICKSTART.md** | Fast 5-minute setup | 5 min |
| **SETUP_GUIDE.md** | Complete setup & configuration | 20 min |
| **INTEGRATION_GUIDE.md** | How frontend connects to backend | 15 min |
| **PAGES_DOCUMENTATION.md** | Details of all 10 pages | 20 min |
| **COMPLETION_SUMMARY.md** | What was built | 10 min |
| **TROUBLESHOOTING.md** | Common issues & solutions | 10 min |
| **DOCUMENTATION_INDEX.md** | This file | 5 min |

### Frontend Documentation

| File | Location | Purpose |
|------|----------|---------|
| **README.md** | frontend/ | Frontend project overview |
| **PAGES_DOCUMENTATION.md** | frontend/ | Detailed page documentation |

---

## 🎯 Quick Reference by Task

### I Want to...

#### 🏃 Get Running Quickly
1. Read: **QUICKSTART.md**
2. Run backend: `npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Open: http://localhost:5173

#### 📖 Understand the Full System
1. Read: **SETUP_GUIDE.md** (Architecture section)
2. Read: **INTEGRATION_GUIDE.md** (full file)
3. Explore: `src/` folder in both backend and frontend

#### 🔌 Add a New Feature
1. Read: **INTEGRATION_GUIDE.md** (Data flow examples)
2. Check: Which API endpoint you need
3. Backend: Create route in `src/routes/`
4. Backend: Create controller in `src/controllers/`
5. Frontend: Add API call in `src/services/api.js`
6. Frontend: Create page in `src/pages/`
7. Frontend: Add route in `App.jsx`

#### 🎨 Customize the UI
1. Read: **PAGES_DOCUMENTATION.md** (page you want to change)
2. Edit: `frontend/src/pages/*.jsx`
3. Styling: Use `frontend/tailwind.config.js` to change colors
4. Rebuild: `npm run dev` auto-refreshes

#### 🚀 Deploy to Production
1. Read: **SETUP_GUIDE.md** (Deployment section)
2. Backend: Follow backend deployment steps
3. Frontend: Follow frontend deployment steps
4. Update: API URL in `frontend/src/services/api.js`

#### 🆘 Fix a Problem
1. Check: **TROUBLESHOOTING.md** for your issue
2. If not found: Check backend logs and browser console
3. Read: **INTEGRATION_GUIDE.md** (Data flow section)

#### 📚 Learn the Code
1. Start: **PAGES_DOCUMENTATION.md**
2. Explore: `frontend/src/pages/` files
3. Check: `frontend/src/services/api.js`
4. Review: `frontend/src/context/AuthContext.jsx`

---

## 📂 File Organization

### Frontend Structure
```
frontend/
├── README.md                           # Frontend project info
├── PAGES_DOCUMENTATION.md              # Detailed page docs
├── src/
│   ├── pages/                          # 10 pages
│   ├── components/                     # 2 components + Navigation
│   ├── services/                       # API integration
│   ├── context/                        # State management
│   └── styles/                         # Tailwind CSS
├── index.html                          # Entry HTML
├── vite.config.js                      # Vite configuration
└── package.json                        # Dependencies
```

### Backend Structure
```
isla/
├── SETUP_GUIDE.md                      # Full setup
├── INTEGRATION_GUIDE.md                # How it connects
├── src/
│   ├── controllers/                    # Business logic
│   ├── routes/                         # API endpoints
│   ├── middlewares/                    # Auth, logging
│   └── utils/                          # JWT, OpenAI
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # DB changes
└── package.json                        # Dependencies
```

---

## 🔑 Key Concepts

### Authentication
- JWT token-based
- Stored in localStorage
- Auto-injected in all API requests
- See: **INTEGRATION_GUIDE.md** (Authentication section)

### State Management
- React Context API
- AuthContext for user state
- Component-level state with useState
- See: **PAGES_DOCUMENTATION.md** (AuthContext section)

### API Integration
- Axios for HTTP requests
- Base URL: http://localhost:3000/api
- 14+ API endpoint groups
- See: **INTEGRATION_GUIDE.md** (full file)

### Styling
- Tailwind CSS utility-first
- Color scheme: Primary, Secondary, Success, Danger, Warning
- Responsive design with mobile-first approach
- See: **PAGES_DOCUMENTATION.md** (Styling section)

### Database
- PostgreSQL with Prisma ORM
- 11+ models for different features
- Migrations for schema changes
- See: **SETUP_GUIDE.md** (Database section)

---

## ⚡ Common Tasks & Where to Find Help

### Setup & Configuration
| Task | Document | Section |
|------|----------|---------|
| First time setup | QUICKSTART.md | Step 1-3 |
| Detailed setup | SETUP_GUIDE.md | Step 1-2 |
| Configure database | SETUP_GUIDE.md | Step 1.2 |
| Add OpenAI key | SETUP_GUIDE.md | Step 1.2 |
| Environment variables | INTEGRATION_GUIDE.md | Configuration |

### Development
| Task | Document | Section |
|------|----------|---------|
| Start development | QUICKSTART.md | Quick Start |
| Add new page | INTEGRATION_GUIDE.md | Deployment |
| Fix styling | PAGES_DOCUMENTATION.md | Styling |
| Understand page | PAGES_DOCUMENTATION.md | Pages 1-10 |
| API integration | INTEGRATION_GUIDE.md | Data Flows |

### Troubleshooting
| Task | Document | Section |
|------|----------|---------|
| Fix errors | TROUBLESHOOTING.md | Common Issues |
| Backend won't start | TROUBLESHOOTING.md | Backend Issues |
| Frontend won't start | TROUBLESHOOTING.md | Frontend Issues |
| API connection | TROUBLESHOOTING.md | CORS errors |
| Database issues | TROUBLESHOOTING.md | Database Issues |

### Deployment
| Task | Document | Section |
|------|----------|---------|
| Deploy backend | SETUP_GUIDE.md | Deployment |
| Deploy frontend | SETUP_GUIDE.md | Deployment |
| Configure for production | INTEGRATION_GUIDE.md | Deployment |
| Security checklist | SETUP_GUIDE.md | Security |

---

## 🎓 Learning Path for New Developers

### Day 1: Understanding
1. Read: **QUICKSTART.md** (5 min)
2. Read: **SETUP_GUIDE.md** - Architecture (10 min)
3. Get it running: Follow QUICKSTART steps (5 min)
4. Total: 20 minutes

### Day 2: Exploration
1. Read: **PAGES_DOCUMENTATION.md** - Pages 1-3 (10 min)
2. Explore: Frontend file structure
3. Click through: All 10 pages in the app (10 min)
4. Total: 20 minutes

### Day 3: Deep Dive
1. Read: **INTEGRATION_GUIDE.md** - Full file (15 min)
2. Read: **PAGES_DOCUMENTATION.md** - Pages 4-10 (10 min)
3. Study: API service layer (`api.js`) (5 min)
4. Total: 30 minutes

### Day 4: Hands-On
1. Try: Adding a small feature
2. Reference: INTEGRATION_GUIDE.md as needed
3. Debug: If issues, check TROUBLESHOOTING.md
4. Learn: How data flows end-to-end

---

## 🔗 External Resources

### Official Documentation
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Express: https://expressjs.com
- Prisma: https://prisma.io
- OpenAI: https://openai.com/api

### Tools
- Postman: Test API calls
- DevTools: Debug frontend (F12)
- Prisma Studio: Browse database (npx prisma studio)
- VS Code: Edit code

---

## 📞 Documentation Reading Guide

### If You Have 5 Minutes
→ Read: **QUICKSTART.md**

### If You Have 15 Minutes
→ Read: **SETUP_GUIDE.md** (first half)

### If You Have 30 Minutes
→ Read: **SETUP_GUIDE.md** + **INTEGRATION_GUIDE.md** (first half)

### If You Have 1 Hour
→ Read: **SETUP_GUIDE.md** + **INTEGRATION_GUIDE.md** + **PAGES_DOCUMENTATION.md** (first 5 pages)

### If You Have 2+ Hours
→ Read: All documentation files in order

---

## ✅ Checklist Before You Start

- [ ] Node.js v16+ installed
- [ ] npm v8+ installed
- [ ] PostgreSQL installed and running
- [ ] Database `isla_db` created
- [ ] .env file with DATABASE_URL
- [ ] Read QUICKSTART.md
- [ ] Read SETUP_GUIDE.md
- [ ] All dependencies installed
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173

---

## 🎯 Where to Find Answers

### Setup Questions
→ **SETUP_GUIDE.md** or **QUICKSTART.md**

### How Does Feature X Work?
→ **INTEGRATION_GUIDE.md** (Data Flow section)

### How Does Page X Look?
→ **PAGES_DOCUMENTATION.md** (Page-specific section)

### Something's Broken
→ **TROUBLESHOOTING.md**

### How to Deploy?
→ **SETUP_GUIDE.md** (Deployment section)

### Code Examples?
→ **INTEGRATION_GUIDE.md** (Code samples in each section)

---

## 🚀 Next Steps

1. **First Time?** → Read QUICKSTART.md
2. **Got It Running?** → Read PAGES_DOCUMENTATION.md
3. **Want to Modify?** → Read INTEGRATION_GUIDE.md
4. **Hit an Issue?** → Check TROUBLESHOOTING.md
5. **Ready to Deploy?** → Read SETUP_GUIDE.md Deployment

---

## 💡 Pro Tips

- **Always check logs first** - Backend terminal and browser console
- **Use Prisma Studio** - Visualize your database easily
- **Read data flows** - Understand how features work
- **Keep docs handy** - Reference while developing
- **Test as you go** - Catch issues early

---

## 📝 Document Purposes Summary

| Document | Best For |
|----------|----------|
| QUICKSTART.md | Getting started fast |
| SETUP_GUIDE.md | Complete understanding |
| INTEGRATION_GUIDE.md | How frontend ↔ backend |
| PAGES_DOCUMENTATION.md | Learning about UI |
| TROUBLESHOOTING.md | Fixing problems |
| COMPLETION_SUMMARY.md | Seeing what's built |
| README.md (frontend) | Frontend overview |

---

## 🎉 You're All Set!

Pick a document to start with based on your needs, and happy coding! 🚀

For most people:
1. Start: **QUICKSTART.md** (5 min)
2. Then: **SETUP_GUIDE.md** (15 min)
3. Then: **PAGES_DOCUMENTATION.md** (20 min)
4. Reference: **INTEGRATION_GUIDE.md** & **TROUBLESHOOTING.md** as needed

---

**Last Updated**: May 2026  
**Status**: All documentation complete ✅
