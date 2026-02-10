# Deployment Guide

This guide covers different deployment options for the Bitrix24 HTTP Request Robot.

## Prerequisites

- Node.js 14+ installed
- HTTPS domain or SSL certificate
- Bitrix24 account with admin access
- Access token with `bizproc` scope

## Deployment Options

### Option 1: Cloud Platforms (Recommended for Production)

#### AWS EC2 + Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize Elastic Beanstalk:**
```bash
eb init -p node.js bitrix-http-robot
```

3. **Create environment:**
```bash
eb create production-env
```

4. **Set environment variables:**
```bash
eb setenv BITRIX24_DOMAIN=your-domain.bitrix24.com
eb setenv BITRIX24_ACCESS_TOKEN=your_token
eb setenv HANDLER_URL=https://your-eb-url.elasticbeanstalk.com
```

5. **Deploy:**
```bash
eb deploy
```

6. **Configure SSL certificate in AWS Certificate Manager**

#### Google Cloud Run

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

2. **Build and deploy:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/bitrix-http-robot
gcloud run deploy bitrix-http-robot \
  --image gcr.io/PROJECT_ID/bitrix-http-robot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Set environment variables in Cloud Run console**

#### Azure App Service

1. **Create App Service:**
```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name bitrix-http-robot \
  --runtime "NODE|18-lts"
```

2. **Configure deployment:**
```bash
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name bitrix-http-robot \
  --src bitrix-http-robot.zip
```

3. **Set environment variables:**
```bash
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name bitrix-http-robot \
  --settings BITRIX24_DOMAIN=your-domain.bitrix24.com
```

### Option 2: PaaS (Easiest for Quick Start)

#### Heroku

1. **Create Heroku app:**
```bash
heroku create bitrix-http-robot
```

2. **Set environment variables:**
```bash
heroku config:set BITRIX24_DOMAIN=your-domain.bitrix24.com
heroku config:set BITRIX24_ACCESS_TOKEN=your_token
heroku config:set HANDLER_URL=https://bitrix-http-robot.herokuapp.com
```

3. **Deploy:**
```bash
git push heroku main
```

4. **Scale:**
```bash
heroku ps:scale web=1
```

#### Render

1. **Create `render.yaml`:**
```yaml
services:
  - type: web
    name: bitrix-http-robot
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: BITRIX24_DOMAIN
        sync: false
      - key: BITRIX24_ACCESS_TOKEN
        sync: false
      - key: HANDLER_URL
        sync: false
```

2. **Connect repository and deploy via Render dashboard**

#### Railway

1. **Install Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Initialize and deploy:**
```bash
railway login
railway init
railway up
```

3. **Set environment variables in Railway dashboard**

### Option 3: VPS (Full Control)

#### DigitalOcean/Linode Droplet

1. **Create droplet with Ubuntu 22.04**

2. **SSH into server:**
```bash
ssh root@your-server-ip
```

3. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install nginx:**
```bash
sudo apt-get install nginx
```

5. **Configure nginx as reverse proxy:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Install SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

7. **Clone and setup application:**
```bash
cd /var/www
git clone your-repo bitrix-http-robot
cd bitrix-http-robot
npm install
```

8. **Create .env file:**
```bash
nano .env
# Add your configuration
```

9. **Setup PM2 for process management:**
```bash
npm install -g pm2
pm2 start server.js --name bitrix-http-robot
pm2 startup
pm2 save
```

### Option 4: Docker

#### Docker Compose

1. **Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. **Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - BITRIX24_DOMAIN=${BITRIX24_DOMAIN}
      - BITRIX24_ACCESS_TOKEN=${BITRIX24_ACCESS_TOKEN}
      - HANDLER_URL=${HANDLER_URL}
    restart: unless-stopped
```

3. **Build and run:**
```bash
docker-compose up -d
```

### Option 5: Local Development with ngrok

**For testing only, not for production!**

1. **Start your server:**
```bash
npm run dev
```

2. **Install ngrok:**
```bash
npm install -g ngrok
```

3. **Start ngrok tunnel:**
```bash
ngrok http 3000
```

4. **Update .env with ngrok URL:**
```env
HANDLER_URL=https://abc123.ngrok.io
```

5. **Run installation script:**
```bash
npm run install-robot
```

## Post-Deployment Steps

### 1. Verify Server is Running

```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Install Robot to Bitrix24

```bash
npm run install-robot
```

### 3. Test the Integration

1. Create a test workflow in Bitrix24
2. Add HTTP Request robot
3. Configure with test URL: `https://jsonplaceholder.typicode.com/posts/1`
4. Method: GET
5. Run workflow and verify response

### 4. Monitor Logs

**PM2:**
```bash
pm2 logs bitrix-http-robot
```

**Docker:**
```bash
docker-compose logs -f
```

**Cloud platforms:**
- Check respective platform's logging dashboard

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3000` |
| `BITRIX24_DOMAIN` | Yes | Your Bitrix24 domain | `company.bitrix24.com` |
| `BITRIX24_ACCESS_TOKEN` | Yes | Access token for API | `abc123...` |
| `HANDLER_URL` | Yes | Public HTTPS URL | `https://api.example.com` |
| `NODE_ENV` | No | Environment mode | `production` |

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables stored securely (not in code)
- [ ] Access tokens have minimal required scopes
- [ ] Server has firewall configured
- [ ] Rate limiting enabled
- [ ] Error logging enabled
- [ ] Health check endpoint accessible
- [ ] Backup/restore plan in place

## Scaling Considerations

### Horizontal Scaling

For high-traffic scenarios:

1. **Load balancer** - Distribute requests across multiple instances
2. **Auto-scaling** - Automatically scale based on load
3. **Container orchestration** - Use Kubernetes for managing containers

### Vertical Scaling

For moderate traffic:

1. **Increase instance size** - More CPU/RAM
2. **Optimize Node.js** - Use clustering
3. **Caching** - Implement response caching if applicable

## Monitoring

### Basic Monitoring

```javascript
// Add to server.js
const os = require('os');

app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.loadavg()
  });
});
```

### Advanced Monitoring

- **Application Performance Monitoring (APM)**: New Relic, DataDog
- **Error tracking**: Sentry
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Log aggregation**: Loggly, Papertrail

## Backup and Recovery

### Backup Strategy

1. **Code**: Version control (Git)
2. **Configuration**: Environment variables documented
3. **Logs**: Rotate and archive regularly

### Disaster Recovery

1. Keep deployment scripts in version control
2. Document environment configuration
3. Test deployment process regularly
4. Have rollback plan ready

## Troubleshooting Deployment

### Server won't start

- Check Node.js version compatibility
- Verify all dependencies installed: `npm install`
- Check environment variables set correctly
- Review error logs

### Can't reach server from Bitrix24

- Verify HTTPS configured correctly
- Check firewall rules allow incoming traffic
- Test with `curl https://your-domain.com/health`
- Verify domain DNS records correct

### SSL certificate errors

- Ensure certificate is valid and not expired
- Check certificate chain is complete
- Verify domain matches certificate

## Performance Optimization

### Node.js Clustering

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const cpuCount = os.cpus().length;

  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.id} died`);
    cluster.fork();
  });
} else {
  // Start server
  require('./server');
}
```

### Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### Request Caching

Consider caching for repeated identical requests (if applicable to your use case).

## Cost Optimization

- **Heroku**: Free tier available, paid plans from $7/month
- **Render**: Free tier available, paid plans from $7/month
- **Railway**: Free tier with usage limits, paid plans from $5/month
- **AWS**: Pay as you go, estimate $10-30/month for small instances
- **DigitalOcean**: Fixed pricing from $6/month for basic droplet

## Conclusion

Choose deployment option based on:
- **Budget**: PaaS free tiers or VPS for cost-effective
- **Scalability**: Cloud platforms for auto-scaling
- **Control**: VPS for full control
- **Simplicity**: PaaS for easiest setup
- **Testing**: ngrok for quick testing
