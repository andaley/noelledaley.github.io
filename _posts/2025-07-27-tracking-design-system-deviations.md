---
layout: post
title:  "Talk: Tracking Design System Deviations"
date:   2025-07-27 07:28:11 -0700
categories: talks
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/XW3PwYNpOtA?si=zp1TmilUaHokLvso" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Last summer I had the pleasure of co-facilitating a discussion on tracking design system deviations at [The Question](https://bencallahan.com/the-question). Ben Callahan wrote a [great recap](https://bencallahan.com/design-system-deviation-is-a-signal) of the conversation, but I wanted to share more details on the technical approach I set up to monitor design system deviation and overall usage at Honeycomb.

I later expanded this approach to other types of migrations—read about it in [Using observability tools to track migrations](/blog/2026/01/23/observability-for-migrations.html).

### Quarterly analysis

Each quarter, I pull up the data in Honeycomb and look for patterns:

- Which components have the most overrides?
- Which props are being customized most frequently?
- Are certain teams consistently working around the system?

This gives us a clear picture of where our design system is falling short.

For example, we discovered that three separate teams were overriding the Button component's padding. This signaled that our default button sizes weren't meeting common use cases. We found Color components with custom `hex` props in 47 places—leading us to expand our color palette. One team consistently overrode spacing on Cards. Turns out they needed a denser variant we hadn't considered.

### What we do with the data

The goal is to learn from deviations. When we see the same override happening across multiple teams, that's a signal that our component doesn't meet a real product need.

We've used this data to add new props and styles to our components, making sure they actually serve our consumers. Instead of fighting against deviations, we treat them as feature requests backed by real usage data.

The feedback loop is clear: deviation → insight → component improvement. This turns our design system into a living system that evolves based on actual product needs rather than assumptions.

---

_Want to apply this pattern to other types of migrations? Check out [my post on using observability for migrations](/blog/2026/01/23/observability-for-migrations.html), which shows how to generalize this approach beyond design systems._