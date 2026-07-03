# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Laravel 12 REST API backend for a personal portfolio website. Pure API — no Blade views or frontend assets. PHP 8.2+, PostgreSQL in production (hosted on Render), MySQL in local Docker dev.

## Common Commands

```bash
# Development server
php artisan serve

# Run dev mode (server + queue + log tail)
composer dev

# Migrations
php artisan migrate
php artisan migrate:fresh --seed

# Tests
php artisan test
# or
composer test

# Code style (Laravel Pint)
./vendor/bin/pint

# Docker local dev
docker-compose up --build
```

## Architecture

All routes are under `/api` prefix (Laravel default). No authentication on any resource endpoint — only `GET /api/user` requires Sanctum. Routes are defined in `routes/api.php` using `Route::apiResource`.

### Data Model

The API serves portfolio content organized into these domains:

- **Profile** — personal info, CV file upload (pdf/doc), photo cover upload, `connect_with_me` JSON array
- **Experience / Experience_Info** — work history; `technologies` and `key_achievements` stored as JSON arrays
- **Project / Project_Info / Project_Type** — portfolio projects with type categorization; `images` and `technologies` as JSON arrays; bilingual (English + Khmer `_kh` fields)
- **Skill / Skill_Info / Skill_Type** — skills with type categorization; bilingual
- **Education_Info / Education_Type / Short_Course / High_School** — education records
- **Talk / Connect_Me / Contact_Info** — social links and contact data
- **Contact form** — `POST /api/send-message` sends email to the owner via `ContactFormMail`; add `?preview=1` to see rendered HTML without sending

### Conventions

- All controllers return `response()->json()`. Errors return `{'error': 'Server error', 'message': '...'}` with HTTP 500.
- Models use `$fillable` and `$casts` for JSON array fields (never `$guarded`).
- Most models have a `status` boolean for active/inactive toggling.
- File uploads go to `storage/app/public/` (public disk). Profile CV also stores `cv_original_name` for download filename.
- `AppServiceProvider` sets `Schema::defaultStringLength(191)` for MySQL compatibility.

### Database

Production uses PostgreSQL (`DB_CONNECTION=pgsql`). The `docker-compose.yml` uses MySQL 8.0 for local dev — set `DB_CONNECTION=mysql` when using Docker. Run `php artisan storage:link` after fresh setup to expose uploaded files via the web.

### Mail

Contact form sends to `nhorn.lik0101@gmail.com`. Configure `MAIL_MAILER` in `.env` (defaults to `log` driver in dev).
