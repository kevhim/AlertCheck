# Reorganization Diff Pack

This folder records the reorganization from the supplied ZIP into the clearer top-level architecture. It does not contain a second copy of the application source.

- `RESTRUCTURE.patch` — patch comparing the imported source snapshot with the reorganized source (generated before this diff folder was added to the patch).
- `RESTRUCTURE_SUMMARY.md` — human-readable description of changes and validation.
- `FILE_MOVE_MAP.md` — previous-to-current directory mapping.

The patch is a reference artifact. The reorganized project is the runnable source of truth. If applying the patch manually, do so to the original directory layout and inspect conflicts before committing.
