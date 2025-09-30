terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Random suffix for unique bucket names
resource "random_string" "bucket_suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  bucket_name = "pr-${var.pr_number}-${var.project_name}-${random_string.bucket_suffix.result}"
  tags = {
    Project     = var.project_name
    Environment = "pr-${var.pr_number}"
    PRNumber    = var.pr_number
    ManagedBy   = "terraform"
    # TTL tag for automatic cleanup
    TTL = var.ttl_hours
  }
}