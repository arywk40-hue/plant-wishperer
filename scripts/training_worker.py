#!/usr/bin/env python3
"""Simple training job worker for PlantWhisperer.

This worker watches `model-jobs/*.json` for jobs in `queued` status.
If `TRAINING_COMMAND_TEMPLATE` is set, it runs that command for each job.
Otherwise it performs a short staged fallback so the job lifecycle is visible
in the UI while the real training command is being wired up.
"""

from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
JOBS_DIR = ROOT_DIR / "model-jobs"
TERMINAL_STATUSES = {"completed", "failed", "cancelled"}


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_job(job_path: Path) -> dict:
    with job_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_job(job_path: Path, payload: dict) -> None:
    with job_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def update_job(job_path: Path, **updates: object) -> dict:
    payload = load_job(job_path)
    payload.update(updates)
    save_job(job_path, payload)
    return payload


def render_training_command(job: dict, job_path: Path) -> str | None:
    template = os.environ.get("TRAINING_COMMAND_TEMPLATE")
    if not template:
        return None

    return template.format(
        dataset_path=job.get("datasetPath", ""),
        epochs=job.get("epochs", 5),
        job_path=str(job_path),
    )


def process_job(job_path: Path) -> None:
    job = load_job(job_path)
    status = job.get("status", "completed")
    if status in TERMINAL_STATUSES:
        return

    update_job(job_path, status="running", progress=10, startedAt=iso_now(), error=None)
    command = render_training_command(job, job_path)

    if command:
        try:
            update_job(job_path, progress=50)
            subprocess.run(
                shlex.split(command),
                cwd=ROOT_DIR,
                check=True,
            )
            update_job(job_path, status="completed", progress=100, completedAt=iso_now())
        except subprocess.CalledProcessError as exc:
            update_job(job_path, status="failed", progress=0, error=str(exc), completedAt=iso_now())
        return

    for progress in (25, 60, 90):
        time.sleep(1.0)
        current = load_job(job_path)
        if current.get("status") == "cancelled":
            return
        update_job(job_path, status="running", progress=progress)

    update_job(job_path, status="completed", progress=100, completedAt=iso_now())


def iter_queued_jobs() -> list[Path]:
    if not JOBS_DIR.exists():
        return []

    queued_jobs: list[Path] = []
    for job_path in sorted(JOBS_DIR.glob("*.json")):
        try:
            job = load_job(job_path)
        except json.JSONDecodeError:
            continue
        if job.get("status", "completed") == "queued":
            queued_jobs.append(job_path)
    return queued_jobs


def run_worker(run_once: bool, poll_interval: float) -> int:
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Watching training jobs in {JOBS_DIR}")

    while True:
        queued_jobs = iter_queued_jobs()
        if not queued_jobs:
            if run_once:
                return 0
            time.sleep(poll_interval)
            continue

        for job_path in queued_jobs:
            print(f"Processing {job_path.name}")
            process_job(job_path)

        if run_once:
            return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Watch and process PlantWhisperer training jobs")
    parser.add_argument("--once", action="store_true", help="Process queued jobs once and exit")
    parser.add_argument("--poll-interval", type=float, default=2.0, help="Seconds to sleep between polls")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    return run_worker(run_once=args.once, poll_interval=args.poll_interval)


if __name__ == "__main__":
    sys.exit(main())
