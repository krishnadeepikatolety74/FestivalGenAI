# UtsavMitra page previews

The supplied HTML screens are merged into the React app and exposed through hash-based preview URLs. Open the project preview, then append one of the paths below to the URL.

| Supplied screen | Preview path | React screen |
| --- | --- | --- |
| Landing | `/` | Landing page |
| Auth | `/#signin` | Sign in |
| Auth | `/#signup` | Create account |
| Home | `/#dashboard` | Dashboard / overview |
| Plan generator | `/#plan` | Four-step plan generator |
| Shopping list | `/#shopping` | Shopping list |
| Budget planner | `/#budget` | Budget planner |
| Recipes | `/#recipes` | Recipes |
| Rituals | `/#rituals` | Rituals & Puja |
| Invitations | `/#invitations` | Invitation & Content Generator |
| Timeline | `/#timeline` | Preparation timeline |
| Nearby stores | `/#nearby` | Nearby stores |
| Reports | `/#reports` | Festival reports |
| Settings | `/#settings` | Settings |

The shared supplied `base.html` is represented by the reusable React `AppLayout`, sidebar, header, and footer components rather than a separate navigable page.

## Local preview

```bash
pnpm install
pnpm dev
```

Use the Vite URL shown in the terminal and append the hash paths above. The project keeps the original landing hero artwork unchanged. All other image-bearing areas use the current realistic-photo mappings with centered, contained, non-distorting image behavior.
