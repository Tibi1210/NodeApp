#!/bin/sh
# Start rsyslog
rsyslogd

# Start your app with PM2
pm2-runtime start dist/index.js --output /var/log/pm2/out.log --error /var/log/pm2/error.log
