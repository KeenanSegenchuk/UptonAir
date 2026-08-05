#!/bin/bash

# Config
ZONE_NAME="upton-air.com"     #*replace these with your domain name*
RECORD_NAME="upton-air.com"   #*replace these with your domain name*
CF_API_TOKEN=""               #*insert cloudflare api key here*

# Get zone ID
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  | jq -r '.result[0].id')

# Get record ID
RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$RECORD_NAME" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  | jq -r '.result[0].id')

# Get current external IP
IP=$(curl -s https://api.ipify.org)

# Update the DNS record
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"$RECORD_NAME\",\"content\":\"$IP\",\"ttl\":120,\"proxied\":true}"

