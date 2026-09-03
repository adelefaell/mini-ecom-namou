# AI_USAGE.md

This is honest documentation of how I used AI while building this project.

## What I used and where

I worked with an AI coding assistant (opencode) as the pair on this project. It ran in my repo, edited files, and ran commands. Here's where it actually got used:

**Feature implementation.** The bulk of the feature work — authentication, cart, wishlist, checkout — was written with the assistant. I'd describe what to build (often copying from a ticket), and it would implement it: schemas, routes, React components, tests. I'd review the diff and ask for changes where it didn't match what I wanted (and that happened a lot).

**Troubleshooting.** Several genuine bugs got diagnosed in a back-and-forth: the dev server failing to resolve shared types at runtime (a module-format issue), test flakiness caused by test files sharing one SQLite file, a list that silently re-rendered. The assistant was good at narrowing these down faster than I would've by hand.

**Repetitive boilerplate.** Shadcn component wiring, skeleton loaders, spinners, empty states — the kind of mechanical UI work where I'd rather review than type.

**The unhappy path (a lot of this):** integration bugs between my code and its code, component styling that fought the design system, and a couple of occasions where reading the world's actual state (why is this failing) took longer than writing the code in the first place.

## What I did myself

Any decisions that felt like judgment calls — the folder layout, one shared types package vs. duplicating, SQLite over a document store, seeding instead of committing a database, the UX flow (cart sheet on first add, confirm-on-remove-above-one, checkout as a distinct review step) — those were mine. The assistant proposed options; I picked and owned them.

## Scope and limits

- No AI generated the *meaning* of the solution. The requirements, the domain vocabulary, and the architecture rationale are mine (or copied from the assessment/tickets I wrote).
- The `README`, `DATABASE.md`, `BACKEND.md`, and this document are written by me in my own words. The AI didn't write the docs — I'm stating positions in them.
- I reviewed every diff before it stayed. That's not a brag; it's how the sessions worked. The most valuable hours were the review-and-fix hours, not the write-hours.

## Would I use it again?

For feature plumbing in a familiar stack: yes, it's a productivity win. For design/architecture decisions: no — I'd rather think through those myself, and the AI tends to produce the same "sensible middle" answer every time.

## A note for anyone reading this

The assessment asked for this file, so here it is in plain terms: AI wrote a large share of the code. I typed a large share of the decisions. If you're evaluating craft, look at the *shape* of the project — the layering, the state model, the error handling, the choices about what was deliberately excluded — because that's where the human judgment shows up, for better or worse.