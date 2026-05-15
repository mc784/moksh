# Moksh - Family Learning Platform

## Overview
A private, family-only teaching platform for kids featuring interactive flashcards, reading drills, stories, and progress tracking. Built as static HTML/CSS/JS for simplicity, with plans to migrate to React later.

## Current State
- **Phase:** Skeleton complete, content for one child added
- **Stack:** Vanilla HTML/CSS/JS (static site)
- **Hosting:** Will deploy to Vercel at `moksh.thinbk.ai`

## Project Structure
```
moksh/
├── index.html              # Home page - kid selector
├── shivaya/
│   └── index.html          # Shivaya's content (age ~5-6)
├── [other-child]/          # Future: add folders per child
│   └── index.html
└── CLAUDE.md               # This file
```

## Content Types

### Currently Implemented
1. **Family Stories** - Simple reading stories featuring family members (Bua Ji, Noni Mata, Taya Ji, Dada Dadi, Papa)
2. **Phonics Practice** - Stories with highlighted consonant blends (sh/ch/th, st/sp/sn, tr/dr/br/gr, cl/bl/fl/pl, ng/nk/mp/nd)

### Planned Features
- Interactive flashcards (flip animation, right/wrong tracking)
- Drill mode (timed practice)
- Progress tracking (localStorage per device)
- Score display and completion badges
- More content types: math facts, sight words, spelling

## Design Decisions

### Why Static HTML (not React yet)
- Quick to prototype and deploy
- No build step needed
- Easy for family to preview locally
- Content is mostly static stories
- Will migrate to React/Next.js when interactivity increases

### Styling Approach
- Inline `<style>` blocks per page (keeps each page self-contained)
- Warm, kid-friendly color palettes
- Large text (1.5rem+) for young readers
- Heavy emoji usage for visual engagement
- Mobile-responsive

### Data Storage Strategy
- No backend for now
- localStorage for progress/scores (device-local)
- Future: Firebase/Supabase if cross-device sync needed

## Deployment Plan
1. Push to GitHub: `mc784/moksh`
2. Connect to Vercel (auto-deploy on push)
3. Add custom domain: `moksh.thinbk.ai`
4. Configure in Namecheap: CNAME `moksh` → `cname.vercel-dns.com`

## Family Context
- Multiple kids will use this (Shivaya is first)
- Each child gets their own folder with age-appropriate content
- Family members referenced in stories are real (aunts, uncles, grandparents)
- Privacy important: site will be password-protected or private URL

## Code Conventions
- Use semantic HTML
- Keep JavaScript minimal and vanilla
- Prefer CSS transitions over JS animations
- Tab-based navigation pattern established
- Each story/lesson is a `<div class="story">` with `<div class="page">` children

## Next Tasks
- [ ] Add interactive flashcard component
- [ ] Implement localStorage for tracking which stories are read
- [ ] Add a second child's content
- [ ] Create drill/quiz mode for phonics
- [ ] Initialize git and deploy to Vercel
