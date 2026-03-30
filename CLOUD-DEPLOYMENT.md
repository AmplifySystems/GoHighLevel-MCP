---
title: "CLOUD DEPLOYMENT"
status: current
version: 1.0
modules:
  - amplify-systems
topics:
  - deployment
current_as_of: 2026-03-30
---

# 🚀 Cloud Deployment Guide - ChatGPT Integration

## 🎯 Overview

To connect your GoHighLevel MCP Server to ChatGPT, you need to deploy it to a **publicly accessible URL**. Here are the best options:

---

## 🌟 **Option 1: Railway (Recommended - Free Tier)**

### **Why Railway?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Fast deployment

### **Deployment Steps:**

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project from GitHub:**
   - Connect your GitHub account
   - Import this repository
   - Railway will auto-detect the Node.js app

3. **Set Environment Variables:**
   ```
   GHL_API_KEY=your_api_key_here
   GHL_BASE_URL=https://services.leadconnectorhq.com
   GHL_LOCATION_ID=your_location_id_here
   NODE_ENV=production
   PORT=8000
   ```

4. **Deploy:**
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app-name.railway.app`

5. **For ChatGPT Integration:**
   ```
   MCP Server URL: https://your-app-name.railway.app/sse
   ```

---

## 🌟 **Option 2: Render (Free Tier)**

### **Deployment Steps:**

1. **Sign up at [Render.com](https://render.com)**

2. **Create Web Service:**
   - Connect GitHub repository
   - Select "Web Service"
   - Runtime: Node

3. **Configuration:**
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

4. **Environment Variables:** (Same as above)

5. **For ChatGPT:**
   ```
   MCP Server URL: https://your-app-name.onrender.com/sse
   ```

---

## 🌟 **Option 3: Vercel (Free Tier)**

### **Deploy with One Click:**

1. **Click Deploy Button:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ghl-mcp-server)

2. **Add Environment Variables** during setup

3. **For ChatGPT:**
   ```
   MCP Server URL: https://your-app-name.vercel.app/sse
   ```

---

## 🌟 **Option 4: Heroku (Paid)**

### **Deployment Steps:**

1. **Install Heroku CLI**

2. **Deploy Commands:**
   ```bash
   heroku create your-app-name
   heroku config:set GHL_API_KEY=your_key_here
   heroku config:set GHL_BASE_URL=https://services.leadconnectorhq.com
   heroku config:set GHL_LOCATION_ID=your_location_id_here
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

3. **For ChatGPT:**
   ```
   MCP Server URL: https://your-app-name.herokuapp.com/sse
   ```

---

## 🎯 **Quick Test Your Deployment**

Once deployed, test these endpoints:

### **Health Check:**
```
GET https://your-domain.com/health
```
Should return:
```json
{
  "status": "healthy",
  "server": "ghl-mcp-server",
  "tools": { "total": 21 }
}
```

### **Tools List:**
```
GET https://your-domain.com/tools
```
Should return all 21 MCP tools.

### **SSE Endpoint (for ChatGPT):**
```
GET https://your-domain.com/sse
```
Should establish Server-Sent Events connection.

---

## 🔗 **Connect to ChatGPT**

### **Once your server is deployed:**

1. **Open ChatGPT Desktop App**
2. **Go to:** Settings → Beta Features → Model Context Protocol
3. **Add New Connector:**
   - **Name:** `GoHighLevel MCP`
   - **Description:** `Connect to GoHighLevel CRM`
   - **MCP Server URL:** `https://your-domain.com/sse`
   - **Authentication:** `OAuth` (or None if no auth needed)

4. **Save and Connect**

### **Test the Connection:**
Try asking ChatGPT:
```
"List all available GoHighLevel tools"
"Create a contact named Test User with email test@example.com"
"Show me recent conversations in GoHighLevel"
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **502 Bad Gateway:**
   - Check environment variables are set
   - Verify GHL API key is valid
   - Check server logs for errors

2. **CORS Errors:**
   - Server includes CORS headers for ChatGPT
   - Ensure your domain is accessible

3. **Connection Timeout:**
   - Free tier platforms may have cold starts
   - First request might be slow

4. **SSE Connection Issues:**
   - Verify `/sse` endpoint is accessible
   - Check browser network tab for errors

### **Debug Commands:**
```bash
# Check server status
curl https://your-domain.com/health

# Test tools endpoint
curl https://your-domain.com/tools

# Check SSE connection
curl -H "Accept: text/event-stream" https://your-domain.com/sse
```

---

## 🎉 **Success Indicators**

### **✅ Deployment Successful When:**
- Health check returns `status: "healthy"`
- Tools endpoint shows 21 tools
- SSE endpoint establishes connection
- ChatGPT can discover and use tools

### **🎯 Ready for Production:**
- All environment variables configured
- HTTPS enabled (automatic on most platforms)
- Server responding to all endpoints
- ChatGPT integration working

---

## 🔐 **Security Notes**

- ✅ All platforms provide HTTPS automatically
- ✅ Environment variables are encrypted
- ✅ No sensitive data in code repository
- ✅ CORS configured for ChatGPT domains only

---

## 💰 **Cost Comparison**

| Platform | Free Tier | Paid Plans | HTTPS | Custom Domain |
|----------|-----------|------------|-------|---------------|
| **Railway** | 512MB RAM, $5 credit | $5/month | ✅ | ✅ |
| **Render** | 512MB RAM | $7/month | ✅ | ✅ |
| **Vercel** | Unlimited | $20/month | ✅ | ✅ |
| **Heroku** | None | $7/month | ✅ | ✅ |

**Recommendation:** Start with Railway's free tier!

---

## 🚀 **Next Steps**

1. **Choose a platform** (Railway recommended)
2. **Deploy your server** following the guide above
3. **Test the endpoints** to verify everything works
4. **Connect to ChatGPT** using your new server URL
5. **Start managing GoHighLevel through ChatGPT!**

Your GoHighLevel MCP Server will be accessible at:
```
https://your-domain.com/sse
```

**Ready to transform ChatGPT into your GoHighLevel control center!** 🎯 