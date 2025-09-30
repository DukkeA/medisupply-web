#!/bin/bash

# Script to clean up old PR environments based on TTL tags
# Run this as a scheduled job to ensure cost control

set -e

AWS_REGION=${AWS_REGION:-"us-east-1"}
PROJECT_NAME=${PROJECT_NAME:-"medisupply-web"}

echo "🧹 Cleaning up old PR environments..."

# Get all S3 buckets with PR environment tags
buckets=$(aws s3api list-buckets \
  --region "$AWS_REGION" \
  --query "Buckets[?contains(Name, 'pr-') && contains(Name, '$PROJECT_NAME')].Name" \
  --output text)

if [ -z "$buckets" ]; then
  echo "No PR environment buckets found."
  exit 0
fi

for bucket in $buckets; do
  echo "Checking bucket: $bucket"

  # Get bucket tags
  tags=$(aws s3api get-bucket-tagging --bucket "$bucket" --region "$AWS_REGION" 2>/dev/null || echo "")

  if [ -n "$tags" ]; then
    # Extract TTL and creation date from tags
    ttl_hours=$(echo "$tags" | jq -r '.TagSet[] | select(.Key=="TTL") | .Value' 2>/dev/null || echo "")

    if [ -n "$ttl_hours" ] && [ "$ttl_hours" != "null" ]; then
      # Get bucket creation date
      creation_date=$(aws s3api head-bucket --bucket "$bucket" --region "$AWS_REGION" 2>/dev/null | grep -i "date" || echo "")

      if [ -n "$creation_date" ]; then
        # Calculate if bucket is older than TTL
        current_time=$(date +%s)
        # Note: This is a simplified check. In production, you'd want more robust date parsing

        echo "Bucket $bucket has TTL of $ttl_hours hours"

        # For safety, let's just list old buckets for now
        echo "⚠️  Bucket $bucket should be reviewed for cleanup"

        # Uncomment the following lines to enable automatic deletion:
        # echo "Deleting bucket $bucket..."
        # aws s3 rm s3://$bucket --recursive --region "$AWS_REGION"
        # aws s3api delete-bucket --bucket "$bucket" --region "$AWS_REGION"
      fi
    fi
  fi
done

echo "✅ Cleanup check completed"