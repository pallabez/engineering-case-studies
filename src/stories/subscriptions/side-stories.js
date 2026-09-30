export const SIDE_STORIES = [
  {
    "eyebrow": "Side story / Approvals",
    "title": "Describe. Preview.<br><em>Approve. Apply.</em>",
    "caption": "A proposed correction changes coverage only when the approved request applies.",
    "noteTitle": "Preview does not grant or remove coverage",
    "note": "Here a proposed signed row removes 4 seats on days 20 through 45. Before apply, the day-25 total remains 30. Applying this correction produces the 26 seats shown at the start of the film. The current preview endpoint calculates adjustment amounts without appending coverage. After the required approvals, apply acquires the account lock, compiles and appends the correction, refreshes affected projections and marks the request applied in the caller’s transaction. Required approval roles depend on the request.",
    "facts": [
      {
        "label": "Proposed correction",
        "value": "−4 seats"
      },
      {
        "label": "Window",
        "value": "Days 20–45"
      },
      {
        "label": "After apply, day 25",
        "value": "26 seats"
      }
    ]
  },
  {
    "eyebrow": "Side story / Migration",
    "title": "Reconstruct.<br><em>Then reconcile.</em>",
    "caption": "Existing coverage needs reconstruction and comparison before the new readers take over.",
    "noteTitle": "Cutover needs evidence",
    "note": "Migration reconstructs coverage from existing source records, materialises projections and compares date-derived states against the predecessor model. Mismatches need investigation and reconciliation before cutover. Catch-up after older application instances drain handles writes made during rollout. Deployment switches the entitlement reader to projections; an empty projection table grants no entitlement. Old history stays available while the display history replacement is built and checked. This describes the migration approach and makes no claim about production completion or success.",
    "facts": [
      {
        "label": "Prepare",
        "value": "Reconstruct coverage"
      },
      {
        "label": "Check",
        "value": "Compare and reconcile"
      },
      {
        "label": "History",
        "value": "Retain existing records"
      }
    ]
  }
];
