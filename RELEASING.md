# Releasing

This checklist is for the repository maintainer.

1. Update `CHANGELOG.md`.
2. Update the version in `package.json`.
3. Install from the lockfile and run all checks:

   ```bash
   npm ci
   npm run check
   npm pack --dry-run
   ```

4. Commit the release:

   ```bash
   git add .
   git commit -m "chore: release vX.Y.Z"
   ```

5. Tag and push:

   ```bash
   git tag vX.Y.Z
   git push origin main --tags
   ```

6. Create a GitHub Release from the tag.
7. Publish to npm only after verifying the package name, files and provenance:

   ```bash
   npm publish --access public
   ```

Never publish from a working tree containing uncommitted changes.
