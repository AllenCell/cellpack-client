# cellPACK Client

### Description
Front end website to interact with the cellPACK services running in AWS. This webpage allows users to run cellPACK packings without having to run code manually or use the commandline.

### Prerequisite
1. Install bun https://bun.sh/docs/installation

### Setup
1. Install dependencies: `bun install`

### Run locally
1. `bun run dev`
2. Navigate to http://localhost:5173/ in your browser

### Run Tests
1. `bun test`

### cellPACK Server
This client interacts with the cellPACK server, which consists of a variety of backend services hosted in AWS to run [cellPACK packings](https://github.com/mesoscope/cellpack). These AWS services include:
* **API Gateway**: cellPACK REST API providing this client with access to needed AWS resources for running and receiving data from cellPACK jobs. Includes the following endpoints:
  * POST /start-packing?recipe={myrecipe}&config={myconfig}
* **ECS**: A call to POST /start-packing launches a new AWS packing job to run. Once the job is completed, the path to the results file(s) is written to the job's `job_status` entry in the cellPACK Firebase database.
* **S3**: Result files from the AWS packing job are written to the `cellpack-demo` S3 bucket.
* **ECR**: Docker image built from the [cellPACK github repo](https://github.com/mesoscope/cellpack) is published to the `cellpack-private` ECR repository. That image defines the container specifications in which the AWS packing job will run.

### cellPACK Database
* **Firebase Firestore**: The cellPACK database is hosted in Firebase Firestore. This database stores all recipes, objects, gradients, compositions, packing configurations, and job statuses. See [CONTRIBUTING.md](CONTRIBUTING.md#firebase-overview) for Firebase overview and [FIREBASE_SCHEMA.md](FIREBASE_SCHEMA.md) for the complete database schema.

#### Resources
* [Server Architecture Overview Diagram](https://docs.google.com/presentation/d/1eG2XCxgYNaoDIYI-M6Tzef17bGuFirZZhmfZlBFTaXc/edit#slide=id.g26c8fd413da_0_34)
* [Staging Firebase Database](https://console.firebase.google.com/u/0/project/cell-pack-database/firestore/databases/-default-/data/~2Fcomposition~2F9XjxZ0ApsNQqCXUbtVTc)
* [Project Notes](https://docs.google.com/document/d/1jqIvf8DzjWgzbG-NMMJ8pdQbi2qQ7wrzLdLqyR7F0i0/edit?tab=t.0#heading=h.yg9wht4r88xr)
