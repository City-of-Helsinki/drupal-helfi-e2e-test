REPOSITORY = ghcr.io/city-of-helsinki/drupal-helfi-e2e-test

ifeq ($(TAG),)
	TAG = latest
endif

.PHONY: build

build:
	docker buildx build --pull -t $(REPOSITORY):$(TAG) ./ --load