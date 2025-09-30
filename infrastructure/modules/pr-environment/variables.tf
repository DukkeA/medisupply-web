variable "pr_number" {
  description = "Pull request number"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "medisupply-web"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "ttl_hours" {
  description = "Time to live in hours for automatic cleanup"
  type        = number
  default     = 168 # 7 days
}

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution for PR environment"
  type        = bool
  default     = false # Disabled by default to reduce costs
}