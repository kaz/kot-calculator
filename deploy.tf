locals {
  name    = "twitter-kot"
  region  = "asia-northeast1"
  project = "<YOUR_PROJECT_ID>"
}

terraform {
  backend "gcs" {
    bucket = "<YOUR_BUCKET_NAME>"
    prefix = "twitter-kot"
  }
}

provider "google" {
  project = local.project
  region  = local.region
}

resource "google_pubsub_topic" "topic" {
  name = local.name
}

resource "google_cloud_scheduler_job" "job" {
  name     = local.name
  schedule = "* * * * *"

  pubsub_target {
    topic_name = google_pubsub_topic.topic.id
    data       = base64encode(" ")
  }
}

resource "google_storage_bucket" "bucket" {
  name     = "${local.project}-${local.name}"
  location = local.region
}

resource "google_storage_bucket_object" "archive" {
  name   = "${filemd5("archive.zip")}.zip"
  bucket = google_storage_bucket.bucket.name
  source = "archive.zip"
}

resource "google_cloudfunctions_function" "function" {
  name = local.name

  runtime             = "nodejs10"
  available_memory_mb = 128
  entry_point         = "update"

  source_archive_bucket = google_storage_bucket.bucket.name
  source_archive_object = google_storage_bucket_object.archive.name

  event_trigger {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.topic.id
  }
}
