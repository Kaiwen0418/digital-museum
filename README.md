# Object Echo

Object Echo is a proof-of-concept website for building personal digital collection pages.  
The current repository is an interactive front-end prototype: a scroll-driven timeline that stages devices, specs, music, and 3D models as a curated exhibition.

## Project Status

This repo is currently a concept proof, not a production-ready platform.

What exists today:

- A React + TypeScript front-end prototype
- A 3D timeline-style presentation layer
- Support for multiple local glTF models
- A landing page plus a museum-style scrolling exhibition
- Experimental interaction patterns for snapping, previewing, and staged transitions

What is planned next:

- Migration to `Next.js + App Router`
- User accounts with `Supabase Auth`
- Project and device data in `Supabase Postgres`
- Asset storage via `Cloudflare R2`
- DIY project creation flow:
  - enter device list
  - match specs
  - choose or upload models
  - choose or upload music
  - publish a personal museum page

## Vision

The long-term goal is to turn this prototype into an open-source, free personal collection builder where users can create their own exhibition-style archive pages for devices and objects they care about.

The intended product direction includes:

- personal museum pages
- editable device timelines
- reusable 3D presentation templates
- model search/import workflows
- music attachment workflows
- public shareable collection pages

## Tech Direction

The prototype currently runs as a front-end app, but the recommended target architecture is:

- Front-end and API: `TypeScript + Next.js App Router`
- Auth and data: `Supabase`
- Large asset storage: `Cloudflare R2`
- 3D rendering: reusable Three.js presentation module extracted from the current prototype

## Running the Current Prototype

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Type-check:

```bash
npm run typecheck
```

## Repository Notes

- The current codebase is optimized for prototyping interaction and presentation, not yet for multi-user production workflows.
- Some model assets in `public/models/` are local references used for staging the visual concept.
- Licensing and copyright handling for third-party models and music are not solved by this prototype and will need explicit platform policy before production use.

## Disclaimer

This repository should be treated as a concept validation project for product, interaction, and presentation design.  
It demonstrates how a personal collection website could feel, but it does not yet implement the full publishing, authentication, storage, or copyright-compliance pipeline required for a public platform.
