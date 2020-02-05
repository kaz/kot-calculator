.PHONY: plan
plan: .terraform archive.zip
	terraform plan

.PHONY: apply
apply: .terraform archive.zip
	terraform apply

.terraform:
	terraform init -backend-config="bucket=$(BUCKET)"

archive.zip: index.js package.json credentials lib
	zip -r $@ $?

.PHONY: clean
clean:
	rm -rf .terraform archive.zip

.PHONY: encrypt
encrypt:
	gpg --default-recipient-self --encrypt env.mk

env.mk:
	gpg --output $@ --decrypt $@.gpg

include env.mk
