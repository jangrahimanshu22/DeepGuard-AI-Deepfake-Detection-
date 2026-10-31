import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.repository import get_record
from backend.services.report_service import generate_pdf_report
from backend.config.settings import settings

router = APIRouter(prefix="/api/report", tags=["Reports"])

@router.get("/{prediction_id}")
def download_report(prediction_id: str, db: Session = Depends(get_db)):
    """Generates and downloads a forensic PDF report certificate for the specified scan."""
    record = get_record(db, prediction_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"No prediction found with ID '{prediction_id}'")

    os.makedirs(settings.storage.reports_dir, exist_ok=True)
    report_filename = f"deepguard_report_{prediction_id}.pdf"
    report_path = os.path.join(settings.storage.reports_dir, report_filename)

    generate_pdf_report(record, report_path)

    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=report_filename,
    )
