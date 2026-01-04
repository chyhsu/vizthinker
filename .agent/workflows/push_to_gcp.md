---
description: Push Docker image to GCP Artifact Registry
---

1. Tag the image
```bash
docker tag 00fe818b001851797b5dbb602cbdc7fc0c20effbe5788f8a09b956a4605f28f5 us-central1-docker.pkg.dev/vizthinker/vizrepo/vizthinker:latest
```

2. Authenticate Docker with GCP
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

3. Push the image
```bash
docker push us-central1-docker.pkg.dev/vizthinker/vizrepo/vizthinker:latest
```
