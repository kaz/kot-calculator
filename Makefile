deploy:
	gcloud functions deploy twitter-kot --entry-point update --trigger-topic twitter-kot --runtime nodejs10 --region asia-northeast1
