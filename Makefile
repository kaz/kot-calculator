.PHONY: default
default:
	@echo boo!

.PHONY: create
create:
	gcloud deployment-manager deployments create twkot --config deployment.yml

.PHONY: update
update:
	gcloud deployment-manager deployments update twkot --config deployment.yml

.PHONY: on
on:
	gcloud scheduler jobs create pubsub twkot-job --schedule "* * * * *" --topic twkot-topic --message-body null

.PHONY: off
off:
	gcloud scheduler jobs delete twkot-job
