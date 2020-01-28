.PHONY: plan
plan: .terraform archive.zip
	terraform plan

.PHONY: apply
apply: .terraform archive.zip
	terraform apply

.terraform:
	terraform init

archive.zip: index.js package.json credentials lib
	zip -r $@ $?

.PHONY: clean
clean:
	rm -rf .terraform archive.zip
