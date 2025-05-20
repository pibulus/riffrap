# Markdown Files Organization Plan

## Current Situation

The LineSnap project currently contains numerous markdown files scattered throughout the codebase, many of which were created during various cleanup and sanitation efforts. This creates clutter and makes it difficult to find relevant documentation.

## Proposed Organization

We propose organizing these files into four categories:

### 1. Essential Documentation (Keep in Current Locations)

- `README.md` - Main project documentation
- `CLAUDE.md` - Code standards and guidelines
- Component-level README files - e.g., `src/lib/components/ghost/README.md`
- Build/asset documentation - e.g., `scripts/README.md`, `static/icons/README.md`

### 2. Technical Documentation (Move to src/docs)

All technical documentation should remain in `src/docs/` with appropriate naming:

- Architecture documentation
- Component design guides
- System documentation (animations, events, error handling)
- Implementation guides

### 3. AI Tool Configuration (Move to .ai-tools/)

Create a `.ai-tools/` directory for AI assistant configuration files:

- `CODESPADAY_SYSTEM.md` → `.ai-tools/codespa-day.md`
- `CODESPA_SYSTEM.md` → `.ai-tools/codespa.md`
- `COMMAND_SYSTEM.md` → `.ai-tools/commands.md`
- `HYGIENE_SYSTEM_VARIABLES.md` → `.ai-tools/hygiene-variables.md`

### 4. Process Archives (Move to .archive/)

Create a `.archive/` directory for completed process documentation:

- Cleanup files:
  - `cleanup_checklist.md` → `.archive/cleanup/checklist.md`
  - `cleanup_report.md` → `.archive/cleanup/report.md`
  - `cleanup_summary.md` → `.archive/cleanup/summary.md`
  - `phase1_cleanup_proposal.md` → `.archive/cleanup/phase1-proposal.md`
  - `phase2_commenting_plan.md` → `.archive/cleanup/phase2-commenting-plan.md`
  - `phase2_ui_simplification.md` → `.archive/cleanup/phase2-ui-simplification.md`

- Sanitation files:
  - `sanitation_manifest.md` → `.archive/sanitation/manifest.md`
  - `sanitation_report.md` → `.archive/sanitation/report.md`
  - `unit_report.md` → `.archive/sanitation/unit-report.md`

- Component-specific refactoring:
  - `PurpleStyleCollectionBox.cleanup.md` → `.archive/refactoring/purple-style-collection-box-cleanup.md`
  - `PurpleStyleCollectionBox.modularization-plan.md` → `.archive/refactoring/purple-style-collection-box-modularization-plan.md`

## Implementation Steps

1. Create the necessary directories:
   ```bash
   mkdir -p .ai-tools
   mkdir -p .archive/cleanup
   mkdir -p .archive/sanitation
   mkdir -p .archive/refactoring
   ```

2. Move AI tool configuration files to `.ai-tools/`

3. Move archive files to appropriate subdirectories in `.archive/`

4. Update `.gitignore` to include the new directories if they should be tracked

5. Update any cross-references between files to reflect the new locations

## Benefits

- Cleaner root directory
- Better organization of documentation files
- Clear separation between active documentation and historical artifacts
- Preserved history of cleanup and sanitation efforts for future reference
- Easier to find relevant documentation