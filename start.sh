#!/bin/sh
# Start rsyslog
rsyslogd
# test commit for auto build
# Start your app with PM2
pm2-runtime start dist/index.js --output /var/log/pm2/out.log --error /var/log/pm2/error.log
