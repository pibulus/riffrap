#!/bin/bash
# Script to organize markdown files in the LineSnap project

# Create necessary directories
mkdir -p .ai-tools
mkdir -p .archive/cleanup
mkdir -p .archive/sanitation
mkdir -p .archive/refactoring
mkdir -p .archive/planning
mkdir -p docs

# Move AI tool configuration files
echo "Moving AI tool configuration files..."
[ -f CODESPADAY_SYSTEM.md ] && mv CODESPADAY_SYSTEM.md .ai-tools/codespa-day.md
[ -f CODESPA_SYSTEM.md ] && mv CODESPA_SYSTEM.md .ai-tools/codespa.md
[ -f COMMAND_SYSTEM.md ] && mv COMMAND_SYSTEM.md .ai-tools/commands.md
[ -f HYGIENE_SYSTEM_VARIABLES.md ] && mv HYGIENE_SYSTEM_VARIABLES.md .ai-tools/hygiene-variables.md

# Move cleanup files to archive
echo "Moving cleanup files to archive..."
[ -f cleanup_checklist.md ] && mv cleanup_checklist.md .archive/cleanup/checklist.md
[ -f cleanup_report.md ] && mv cleanup_report.md .archive/cleanup/report.md
[ -f cleanup_summary.md ] && mv cleanup_summary.md .archive/cleanup/summary.md
[ -f phase1_cleanup_proposal.md ] && mv phase1_cleanup_proposal.md .archive/cleanup/phase1-proposal.md
[ -f phase2_commenting_plan.md ] && mv phase2_commenting_plan.md .archive/cleanup/phase2-commenting-plan.md
[ -f phase2_ui_simplification.md ] && mv phase2_ui_simplification.md .archive/cleanup/phase2-ui-simplification.md
[ -f ui_simplification_proposal.md ] && mv ui_simplification_proposal.md .archive/cleanup/ui-simplification-proposal.md

# Move sanitation files to archive
echo "Moving sanitation files to archive..."
[ -f sanitation_manifest.md ] && mv sanitation_manifest.md .archive/sanitation/manifest.md
[ -f sanitation_report.md ] && mv sanitation_report.md .archive/sanitation/report.md
[ -f unit_report.md ] && mv unit_report.md .archive/sanitation/unit-report.md

# Move component-specific refactoring files to archive
echo "Moving component-specific refactoring files to archive..."
[ -f PurpleStyleCollectionBox.cleanup.md ] && mv PurpleStyleCollectionBox.cleanup.md .archive/refactoring/purple-style-collection-box-cleanup.md
[ -f src/lib/components/mainPage/PurpleStyleCollectionBox.modularization-plan.md ] && mv src/lib/components/mainPage/PurpleStyleCollectionBox.modularization-plan.md .archive/refactoring/purple-style-collection-box-modularization-plan.md
[ -f src/lib/components/mainPage/PurpleStyleCollectionBox-script.md ] && mv src/lib/components/mainPage/PurpleStyleCollectionBox-script.md .archive/refactoring/purple-style-collection-box-script.md
[ -f src/lib/components/mainPage/PurpleStyleCollectionBox-style.md ] && mv src/lib/components/mainPage/PurpleStyleCollectionBox-style.md .archive/refactoring/purple-style-collection-box-style.md
[ -f src/lib/components/mainPage/PurpleStyleCollectionBox-template.md ] && mv src/lib/components/mainPage/PurpleStyleCollectionBox-template.md .archive/refactoring/purple-style-collection-box-template.md

# Move planning files to archive
echo "Moving planning files to archive..."
[ -f PR_DESCRIPTION.md ] && mv PR_DESCRIPTION.md .archive/planning/pr-description.md
[ -f app_enhancement_pr.md ] && mv app_enhancement_pr.md .archive/planning/app-enhancement-pr.md
[ -f app_health_assessment.md ] && mv app_health_assessment.md .archive/planning/app-health-assessment.md
[ -f integration_summary.md ] && mv integration_summary.md .archive/planning/integration-summary.md

# Copy the organization plan to the archive
cp docs/markdown_organization_plan.md .archive/

# Update .gitignore to track the new directories
if ! grep -q "\.archive" .gitignore; then
  echo "" >> .gitignore
  echo "# Don't ignore archive directories" >> .gitignore
  echo "!.archive/" >> .gitignore
  echo "!.ai-tools/" >> .gitignore
fi

echo "Markdown files have been organized according to the plan."
echo "You can find:"
echo "- AI tool configuration files in .ai-tools/"
echo "- Archived cleanup files in .archive/cleanup/"
echo "- Archived sanitation files in .archive/sanitation/"
echo "- Archived refactoring files in .archive/refactoring/"
echo "- Archived planning files in .archive/planning/"

echo "Done! Use 'git status' to review changes before committing."