# Contributing to Allen Institute for Cell Science Open Source

Thank you for your interest in contributing to this Allen Institute for Cell Science open source project! This document is
a set of guidelines to help you contribute to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of
Conduct][code_of_conduct].

[code_of_conduct]: CODE_OF_CONDUCT.md

## Project Documentation

The `README` in the root of the repository should contain or link to
project documentation. If you cannot find the documentation you're
looking for, please file a GitHub issue with details of what
you'd like to see documented.

## Firebase Overview

cellPACK Studio reads recipe data from Firebase and writes user edits back. The backend handles uploading recipes and running packing jobs.

### Collections Used by cellPACK Studio

| Collection | What It Does | Access |
|------------|--------------|---------------|
| `example_packings` | Maps recipes to UI display names and editable fields | Read |
| `editable_fields` | Defines which recipe fields users can edit | Read |
| `recipes` | Full recipe data with references | Read |
| `objects` | Object definitions (molecules, organelles) | Read |
| `gradients` | Gradient definitions for spatial distributions | Read |
| `composition` | Composition definitions | Read |
| `recipes_edited` | User-modified recipes | Write |
| `job_status` | Packing job progress | Poll (read) |

> **Note:** Collections like `configs` and `results` are managed by the backend. For the complete database schema, see [FIREBASE_SCHEMA.md](FIREBASE_SCHEMA.md).

### Getting Access

- **Development:** Create your own Firebase project in test mode. See [Firebase Firestore tutorial](https://firebase.google.com/docs/firestore).
- **Staging:** Contact the code owner for credentials, then configure your `.env` file (see README).


## How to Contribute

Typical steps to contribute:

1. Fork the repo on GitHub.

2. Create a branch and make your edits on your branch, pushing back to your fork.

3. Ensure that your changes are working, pass any linting and tests in the project. Add tests and documentation as needed.

4. Submit a pull request to merge your fork's branch into this repository, via GitHub.

## Deployment

#### Staging deployment
Automatically builds from `main`
- [Staging site](https://allencell.github.io/cellpack-client/)

#### Production deployment
Make sure the main branch is checked out and all desired changes are merged. Then:
1. Make a new version: `bun pm version [patch/minor/major]` -- this will give you the new tag, e.g., `1.3.2`
2. Push the new package.json version: `git push origin main`
3. Push the new tag: `git push origin [NEW_TAG]` -- e.g. `git push origin v1.3.2`
4. Write up [release notes](https://github.com/AllenCell/cellpack-client/releases).
    - Select the tag
    - Click "generate release notes"
    - Use this template to summarize changes (delete any categories that aren't relevant)

## Questions or Thoughts?

Talk to us on [one of our community forums][community].

[community]: https://forum.allencell.org/
