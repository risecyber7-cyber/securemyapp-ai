import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import select
from backend.app.core.database import SessionLocal
from backend.app.models.entities import Project
from backend.app.schemas.scan import ScanCreate
from backend.app.models.enums import ScanType
from backend.app.services.scan_orchestrator import create_scan_job, run_scan_pipeline

def scan_all_projects():
    db = SessionLocal()
    try:
        projects = db.execute(select(Project)).scalars().all()
        if not projects:
            print("No projects found to scan.")
            return

        print(f"Found {len(projects)} projects. Starting bulk scan...")
        
        for project in projects:
            print(f"-> Scheduling scan for project: {project.name} (ID: {project.id})")
            # Usually we need an actor_id. Using a mock or finding the workspace owner.
            actor_id = "user_demo" # Mock fallback
            
            payload = ScanCreate(
                workspace_id=project.workspace_id,
                scan_type=ScanType.WEBSITE,
                project_id=project.id,
                public_website_url=f"https://{project.name.lower().replace(' ', '')}.example.com"
            )
            
            scan = create_scan_job(db, actor_id, payload)
            print(f"   Created scan job {scan.id}. Running pipeline...")
            run_scan_pipeline(db, scan.id)
            print(f"   Scan {scan.id} completed. Status: {scan.status}")
            
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    scan_all_projects()
