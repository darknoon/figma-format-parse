# Repository workflow

## Commit and push by default

- Routine work goes directly to the repository's default branch. It is currently
  `master`; references to "main" mean the default branch, not a request to rename it.
- Finish the requested work, run checks appropriate to the change, and make small,
  logical commits. Keep unrelated changes separate, including parser and UI work
  when they can be reviewed independently.
- Commit and push completed work automatically. The repository owner has given
  standing authorization for ordinary commits and non-force pushes to `origin`,
  including the default branch; do not ask for confirmation each time.
- Check the working tree and staged diff before committing. Stage only the files
  or hunks belonging to your task, and preserve other people's uncommitted work.
- If the remote advances, incorporate its changes without overwriting them, resolve
  any conflicts, and rerun affected checks before pushing. Do not force-push the
  default branch.

## Isolate overlapping parallel work

- Use a separate worktree and a `codex/` branch when concurrent tasks could edit
  the same files, or when the user explicitly requests an isolated branch or PR.
  Do not create a branch or PR for routine work merely out of habit.
- Keep edits, staging, commits, and any dev server for that parallel task in its
  own worktree. Use a separate port when multiple dev servers are running.
- Coordinate integration with the other task before changing shared files. Preserve
  changes already landed on the default branch when integrating the isolated work.
- When a PR is used, follow `.github/PULL_REQUEST_TEMPLATE.md`. The template governs
  PR descriptions; its presence does not make PRs mandatory. For stacked PRs,
  identify dependencies and merge order.

## Validation

- Match validation to the change: relevant existing checks for code, browser
  inspection for UI, and a diff review for documentation-only changes. Respect
  explicit instructions about whether to add tests.
- Report what was completed, what was checked, and whether it was pushed. If a tool
  blocks an authorized action, report the exact action and stated reason rather
  than implying it succeeded.
