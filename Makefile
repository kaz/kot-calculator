.PHONY: plan
plan: .terraform
	terraform plan

.PHONY: apply
apply: .terraform archive.zip
	terraform apply

.terraform:
	terraform init

archive.zip: index.js package.json auth
	zip -r $@ $^
