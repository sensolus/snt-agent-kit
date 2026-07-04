#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <repository-name>"
    echo "Example: $0 {{APP_NAME}}"
    exit 1
fi

REPO_NAME="$1"
REGION="${AWS_REGION:-eu-west-1}"

echo "Creating ECR repository: $REPO_NAME in $REGION"

aws ecr create-repository \
    --repository-name "$REPO_NAME" \
    --region "$REGION" \
    --image-scanning-configuration scanOnPush=true

echo "Setting lifecycle policy to retain only 3 images"

aws ecr put-lifecycle-policy \
    --repository-name "$REPO_NAME" \
    --region "$REGION" \
    --lifecycle-policy-text '{
        "rules": [
            {
                "rulePriority": 1,
                "description": "Keep only 3 images",
                "selection": {
                    "tagStatus": "any",
                    "countType": "imageCountMoreThan",
                    "countNumber": 3
                },
                "action": {
                    "type": "expire"
                }
            }
        ]
    }'

echo "Done. Repository URL: $(aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" --query 'repositories[0].repositoryUri' --output text)"
