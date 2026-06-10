output "alb_dns_name" {
  description = "ALB DNS name."
  value       = aws_lb.app.dns_name
}

output "app_url" {
  description = "Public URL served by the ALB."
  value       = "http://${aws_lb.app.dns_name}"
}

output "argocd_url" {
  description = "Public ArgoCD UI URL served by the ALB."
  value       = "http://${aws_lb.app.dns_name}:${var.argocd_alb_port}"
}
