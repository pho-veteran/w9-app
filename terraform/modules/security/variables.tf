variable "name_prefix" {
  description = "Prefix used in resource names."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where security groups are created."
  type        = string
}

variable "node_port" {
  description = "Application port exposed from EC2 host to ALB."
  type        = number
}

variable "common_tags" {
  description = "Common tags applied to all AWS resources."
  type        = map(string)
}
