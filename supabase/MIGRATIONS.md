# Migrations Supabase

Ordre d’exécution dans **SQL Editor** (ou `supabase db push`).

| Fichier | Rôle |
|---------|------|
| `20260803100000_init.sql` | Tables + indexes + RLS (schéma **complet**) |
| `20260803100001_storage.sql` | Bucket `uploads` + lecture publique |
| `20260803100002_seed_content.sql` | Clés `app_content` initiales (site, story, seating-plan, etc.) |
| `20260803100003_grants.sql` | Droits `service_role` (backend Vercel) |
| `20260803100004_rsvp_ticket_views.sql` | Colonnes vues carte (idempotent) |
| `20260810100005_rsvp_blocked.sql` | Colonne `blocked_at` (idempotent) |
| `20260811100006_mc_rundown.sql` | Clé `mc-rundown` (idempotent) |
| `20260812100007_rsvp_seating.sql` | Colonnes `table_label` / `seat_label` (idempotent) |
| `20260812100008_seating_plan.sql` | Clé `seating-plan` (idempotent) |
| **`20260812100009_schema_complete.sql`** | **Sync Vercel** — à rejouer si le schéma est incomplet |
| `20260813100010_admin_roles.sql` | Profils : `guests` / `reader` (remplace `coordinator`) |

## Projet déjà déployé sur Vercel

Exécuter surtout :

```text
20260812100009_schema_complete.sql
```

Puis, si besoin uniquement des rôles :

```text
20260813100010_admin_roles.sql
```

Cela ajoute les colonnes / clés manquantes sans écraser les données.

## Nouvelle base

Exécuter **tous** les fichiers dans l’ordre chronologique du préfixe.

## Structure attendue par l’app

### Table `rsvps`
`ticket_viewed_at`, `ticket_view_count`, `blocked_at`, `table_label`, `seat_label` (+ champs init)

### Clés `app_content`
`site`, `story`, `schedule`, `menu`, `drinks`, `desserts`, `mc-rundown`, `seating-plan`, `rsvp_blocks`, `rsvp_reminders`

### Storage
Bucket public `uploads`
