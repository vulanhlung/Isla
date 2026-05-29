# ISLA - Troubleshooting & FAQs

## Common Issues & Solutions

---

## 🚨 Backend Issues

### Issue: "Server running on port 3000" then crash

**Symptoms**: Backend starts then immediately stops

**Solutions**:
1. Check Node.js version (needs v16+)
   ```bash
   node --version
   ```
2. Check for syntax errors in code
3. Look for missing dependencies
   ```bash
   npm install
   ```
4. Check database connection in .env

---

### Issue: "Cannot find module '@prisma/client'"

**Cause**: Prisma not installed

**Solution**:
```bash
npm install @prisma/client prisma
npx prisma migrate deploy
```

---

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Cause**: PostgreSQL not running

**Solutions**:
- **Windows**: Start PostgreSQL service
  - Services → PostgreSQL
  - Or use pgAdmin

- **Mac**: 
  ```bash
  brew services start postgresql
  ```

- **Linux**:
  ```bash
  sudo service postgresql start
  ```

---

### Issue: Database doesn't exist

**Solutions**:
```bash
# Create database
createdb isla_db

# Or use psql
psql
# Then: CREATE DATABASE isla_db;
```

---

### Issue: Prisma migration fails

**Solutions**:
```bash
# Check status
npx prisma migrate status

# Resolve and retry
npx prisma migrate deploy

# Or reset for development
npx prisma migrate reset
```

---

### Issue: "Port 3000 already in use"

**Windows**:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
lsof -ti:3000 | xargs kill -9
```

---

### Issue: OpenAI API errors

**Symptoms**: Chat features not working

**Solutions**:
1. Check API key in .env: `OPENAI_API_KEY=sk-...`
2. Verify key is valid and active
3. Check API rate limits
4. See OpenAI dashboard for usage
5. Add error logging to see exact error

---

### Issue: CORS errors in browser console

**Cause**: Frontend and backend communication blocked

**Solutions**:
1. Ensure backend is running on port 3000
2. Check proxy config in vite.config.js
3. Verify API_BASE_URL in api.js
4. Check browser console for details

---

## 🎨 Frontend Issues

### Issue: "Cannot find module 'react'"

**Cause**: Dependencies not installed

**Solution**:
```bash
cd frontend
npm install
```

---

### Issue: "Port 5173 already in use"

**Solution**:
```bash
npm run dev -- --port 3001
```

---

### Issue: Vite build errors

**Solutions**:
```bash
# Clear cache
rm -rf dist node_modules
npm install

# Rebuild
npm run build
```

---

### Issue: Styling not applied (Tailwind not working)

**Solutions**:
1. Check postcss.config.js exists
2. Verify tailwind.config.js has correct content paths
3. Check globals.css has @tailwind directives
4. Restart dev server

---

### Issue: Pages blank or not loading

**Cause**: Missing imports or routing issue

**Solutions**:
1. Check browser console (F12) for errors
2. Verify page is imported in App.jsx
3. Check route path spelling
4. Verify component exports default

---

### Issue: API calls return 404

**Cause**: Endpoint doesn't exist

**Solutions**:
1. Check backend has the route
2. Verify URL spelling in api.js
3. Check HTTP method (GET, POST, etc.)
4. Look at backend server output

---

## 🔐 Authentication Issues

### Issue: "Cannot login - invalid credentials"

**Cause**: Wrong email or password

**Solutions**:
1. Double-check email and password
2. Ensure account was created successfully
3. Check database has user record:
   ```bash
   npx prisma studio
   # Check Users table
   ```
4. Try registering new account

---

### Issue: Token not working / Auto-logout

**Cause**: Token expired or invalid

**Solutions**:
1. Clear localStorage
   - Open DevTools (F12)
   - Application → localStorage
   - Delete 'token' and 'user'
2. Login again
3. Check JWT_SECRET matches between sessions

---

### Issue: "Unauthorized" error on protected routes

**Cause**: No valid token

**Solutions**:
1. Login first
2. Check token in localStorage
3. Verify API is sending Authorization header
4. Check Authorization header format: `Bearer <token>`

---

## 💾 Database Issues

### Issue: Data not persisting after page refresh

**Cause**: Not actually saved to database

**Solutions**:
1. Check network request succeeded (status 200-201)
2. Verify database is connected
3. Check backend logs for errors
4. Use Prisma Studio to verify data exists:
   ```bash
   npx prisma studio
   ```

---

### Issue: Duplicate data or strange values

**Cause**: Database corruption or logic error

**Solutions**:
1. For development, reset database:
   ```bash
   npx prisma migrate reset
   ```
2. Check controller logic for mutations
3. Verify input validation

---

## 📱 Mobile/Responsive Issues

### Issue: Layout broken on mobile

**Solutions**:
1. Check viewport meta tag in index.html
2. Verify Tailwind breakpoints
3. Test with DevTools device emulation (F12)
4. Check component uses responsive classes

---

### Issue: Touch events not working

**Solutions**:
1. Verify buttons are large enough (minimum 44px)
2. Check z-index conflicts
3. Test with real device
4. Check event handlers attached correctly

---

## ⚡ Performance Issues

### Issue: Page loads slowly

**Solutions**:
1. Check network requests (DevTools → Network)
2. Look for slow API calls
3. Verify database queries are optimized
4. Check for console errors
5. Profile with DevTools Performance tab

---

### Issue: High CPU usage

**Cause**: Infinite loops or excessive re-renders

**Solutions**:
1. Check dependencies in useEffect
2. Look for missing return statements
3. Use React DevTools Profiler
4. Check for unnecessary re-renders

---

## 🐛 Debugging Tips

### View Backend Logs
- Check terminal where you ran `npm run dev`
- Look for request logs
- See error messages immediately
- Format: `METHOD /path - status`

---

### View Frontend Logs
- Open DevTools: F12
- Console tab shows errors
- Network tab shows API calls
- Application tab shows storage

---

### Check Database
```bash
# Open Prisma Studio
npx prisma studio
# Browse all tables graphically
```

---

### Test API Directly
```bash
# Use curl or Postman
curl -X GET http://localhost:3000/api/moods \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ❓ FAQs

### Q: Do I need both terminals open?
**A**: Yes, run backend in one terminal and frontend in another.

---

### Q: Can I change the API URL?
**A**: Yes, edit `API_BASE_URL` in `frontend/src/services/api.js`

---

### Q: How do I reset everything?
**A**:
```bash
# Backend
npx prisma migrate reset

# Frontend
rm -rf node_modules dist
npm install
```

---

### Q: Where are my tokens stored?
**A**: Browser localStorage - see DevTools Application tab

---

### Q: How do I view my data?
**A**:
```bash
npx prisma studio
# Open http://localhost:5555
```

---

### Q: Can I modify the database schema?
**A**: Yes, edit `prisma/schema.prisma` and run:
```bash
npx prisma migrate dev --name your_change_name
```

---

### Q: How do I add a new page?
**A**:
1. Create `src/pages/NewPage.jsx`
2. Import in `App.jsx`
3. Add route in Routes
4. Add link in Navigation.jsx

---

### Q: How do I add OpenAI API?
**A**:
1. Get key from openai.com
2. Add to .env: `OPENAI_API_KEY=sk-...`
3. Chat feature will work automatically

---

### Q: How do I deploy to production?
**A**: See SETUP_GUIDE.md section "Deployment"

---

## 📋 Checklist for Getting Help

Before asking for help, verify:
- [ ] Backend is running (port 3000)
- [ ] Frontend is running (port 5173)
- [ ] Database is connected
- [ ] .env file has DATABASE_URL
- [ ] Node.js version is v16+
- [ ] All dependencies installed
- [ ] No syntax errors in code
- [ ] Checked backend logs
- [ ] Checked browser console
- [ ] Tried clearing cache/localStorage

---

## 🔗 Useful Resources

### Documentation
- QUICKSTART.md - Fast setup
- SETUP_GUIDE.md - Detailed setup
- INTEGRATION_GUIDE.md - How it works
- PAGES_DOCUMENTATION.md - Page details

### External Resources
- React Docs: reactjs.org
- Vite Docs: vitejs.dev
- Tailwind Docs: tailwindcss.com
- Express Docs: expressjs.com
- Prisma Docs: prisma.io

---

## 📞 Getting Support

### For Setup Issues
1. Check QUICKSTART.md
2. Review SETUP_GUIDE.md
3. Run full diagnostic:
   ```bash
   node --version
   npm --version
   npx prisma --version
   ```

### For API Issues
1. Check INTEGRATION_GUIDE.md
2. Use Prisma Studio
3. Check backend logs
4. Test with curl

### For UI Issues
1. Check PAGES_DOCUMENTATION.md
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for API calls

---

## 🎯 Quick Fix Commands

```bash
# Fix npm dependencies
npm install
npm audit fix

# Fix Prisma
npx prisma migrate deploy
npx prisma generate

# Fix TypeScript/linting
npm run lint

# Clear cache
rm -rf node_modules dist
npm install

# Reset database (dev only!)
npx prisma migrate reset

# Test API connectivity
curl http://localhost:3000/api

# View logs in real-time
npm run dev 2>&1 | tee app.log
```

---

## ✅ Verification Steps

After making changes:

1. **Backend**: See "Server running on port 3000" in logs
2. **Frontend**: See "Local: http://localhost:5173" in logs
3. **Database**: Can open Prisma Studio
4. **API**: Can make requests without 404
5. **Auth**: Can register and login
6. **Pages**: All pages load correctly
7. **Data**: Saves and retrieves from DB

---

**Remember**: Most issues have simple solutions. Check the logs first! 🔍
