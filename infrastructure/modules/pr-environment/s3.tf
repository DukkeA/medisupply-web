# S3 bucket for PR environment
resource "aws_s3_bucket" "pr_website" {
  bucket = local.bucket_name
  tags   = local.tags
}

# Public read access for PR environments (simpler setup, lower cost)
resource "aws_s3_bucket_public_access_block" "pr_website" {
  bucket = aws_s3_bucket.pr_website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy for public read access
resource "aws_s3_bucket_policy" "pr_website" {
  bucket = aws_s3_bucket.pr_website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.pr_website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.pr_website]
}

# Website configuration
resource "aws_s3_bucket_website_configuration" "pr_website" {
  bucket = aws_s3_bucket.pr_website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# Lifecycle configuration for automatic cleanup
resource "aws_s3_bucket_lifecycle_configuration" "pr_website" {
  bucket = aws_s3_bucket.pr_website.id

  rule {
    id     = "pr_cleanup"
    status = "Enabled"

    # Delete all objects after TTL period
    expiration {
      days = ceil(var.ttl_hours / 24)
    }

    # Clean up incomplete multipart uploads immediately
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}