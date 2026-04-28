# routers/payslips.py
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from db.client import get_db
from middleware.auth import require_admin, require_employee

router = APIRouter()


class PayslipIn(BaseModel):
    emp_id: str
    month_label: str
    gross_pay: float
    deductions: float = 0.0
    net_pay: float
    status: str = "Pending"


class StatusIn(BaseModel):
    status: str


def _get_emp_pk(db, emp_id: str) -> int:
    res = db.table("smt_employees").select("id").eq("emp_id", emp_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Employee not found")
    return res.data[0]["id"]


def _generate_pdf(payslip: dict, employee: dict) -> bytes:
    """Generate a professional payslip PDF using reportlab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
                                topMargin=15*mm, bottomMargin=15*mm,
                                leftMargin=20*mm, rightMargin=20*mm)
        styles = getSampleStyleSheet()

        BLUE = colors.HexColor("#1e3a5f")
        ACCENT = colors.HexColor("#2563eb")
        LIGHT = colors.HexColor("#f0f4ff")
        GREEN = colors.HexColor("#16a34a")

        title_style = ParagraphStyle("Title", parent=styles["Normal"],
                                     fontSize=22, textColor=colors.white,
                                     alignment=TA_LEFT, fontName="Helvetica-Bold")
        sub_style = ParagraphStyle("Sub", parent=styles["Normal"],
                                   fontSize=10, textColor=colors.HexColor("#cbd5e1"),
                                   alignment=TA_LEFT)
        section_style = ParagraphStyle("Section", parent=styles["Normal"],
                                       fontSize=11, textColor=BLUE, fontName="Helvetica-Bold",
                                       spaceAfter=4)
        label_style = ParagraphStyle("Label", parent=styles["Normal"],
                                     fontSize=9, textColor=colors.HexColor("#64748b"))
        value_style = ParagraphStyle("Value", parent=styles["Normal"],
                                     fontSize=10, fontName="Helvetica-Bold", textColor=BLUE)

        emp_name = employee.get("name", "—")
        emp_id   = employee.get("emp_id", "—")
        role     = employee.get("role") or "—"
        dept     = employee.get("dept") or "—"
        month    = payslip.get("month_label", "—")
        gross    = float(payslip.get("gross_pay", 0))
        ded      = float(payslip.get("deductions", 0))
        net      = float(payslip.get("net_pay", 0))

        story = []

        # ── Header banner ──────────────────────────────────────
        header_data = [[
            Paragraph("Soft Master Technology", title_style),
            Paragraph(f"PAY SLIP – {month}", ParagraphStyle("PR", parent=title_style,
                                                              alignment=TA_RIGHT, fontSize=13,
                                                              textColor=colors.HexColor("#93c5fd"))),
        ]]
        header_table = Table(header_data, colWidths=["60%", "40%"])
        header_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BLUE),
            ("TOPPADDING",    (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("LEFTPADDING",   (0, 0), (0, -1), 12),
            ("RIGHTPADDING",  (-1, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 6*mm))

        # ── Employee info ──────────────────────────────────────
        story.append(Paragraph("EMPLOYEE DETAILS", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=4))

        info_data = [
            [Paragraph("Employee Name", label_style), Paragraph(emp_name, value_style),
             Paragraph("Employee ID",   label_style), Paragraph(emp_id,   value_style)],
            [Paragraph("Designation",  label_style), Paragraph(role, value_style),
             Paragraph("Department",   label_style), Paragraph(dept, value_style)],
            [Paragraph("Pay Period",   label_style), Paragraph(month, value_style),
             Paragraph("Pay Status",   label_style), Paragraph(payslip.get("status", "—"), value_style)],
        ]
        info_table = Table(info_data, colWidths=["22%", "28%", "22%", "28%"])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT]),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("ROUNDEDCORNERS", [4]),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 6*mm))

        # ── Earnings & deductions ──────────────────────────────
        story.append(Paragraph("EARNINGS & DEDUCTIONS", section_style))
        story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=4))

        basic   = round(gross * 0.50, 2)
        hra     = round(gross * 0.20, 2)
        special = round(gross - basic - hra, 2)
        pf      = round(ded * 0.60, 2)
        tax     = round(ded - pf, 2)

        pay_data = [
            ["EARNINGS", "Amount (₹)", "DEDUCTIONS", "Amount (₹)"],
            ["Basic Salary",   f"₹{basic:,.2f}",   "Provident Fund", f"₹{pf:,.2f}"],
            ["HRA",            f"₹{hra:,.2f}",     "Income Tax (TDS)", f"₹{tax:,.2f}"],
            ["Special Allow.", f"₹{special:,.2f}", "",               ""],
            ["GROSS PAY",      f"₹{gross:,.2f}",   "TOTAL DEDUCTIONS", f"₹{ded:,.2f}"],
        ]
        pay_table = Table(pay_data, colWidths=["30%", "20%", "30%", "20%"])
        pay_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BLUE),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
            ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",   (0, 0), (-1, 0), 9),
            ("BACKGROUND", (0, 4), (-1, 4), LIGHT),
            ("FONTNAME",   (0, 4), (-1, 4), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, 3), [colors.white, LIGHT, colors.white]),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("ALIGN", (3, 0), (3, -1), "RIGHT"),
        ]))
        story.append(pay_table)
        story.append(Spacer(1, 6*mm))

        # ── Net pay box ────────────────────────────────────────
        net_data = [[
            Paragraph("NET PAY", ParagraphStyle("NL", parent=styles["Normal"],
                                                 fontSize=14, textColor=colors.white,
                                                 fontName="Helvetica-Bold")),
            Paragraph(f"₹{net:,.2f}", ParagraphStyle("NV", parent=styles["Normal"],
                                                       fontSize=18, textColor=colors.white,
                                                       fontName="Helvetica-Bold", alignment=TA_RIGHT)),
        ]]
        net_table = Table(net_data, colWidths=["50%", "50%"])
        net_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN),
            ("TOPPADDING",    (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("LEFTPADDING",   (0, 0), (0, -1), 14),
            ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(net_table)
        story.append(Spacer(1, 8*mm))

        # ── Footer ─────────────────────────────────────────────
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1")))
        story.append(Spacer(1, 3*mm))
        footer_style = ParagraphStyle("Footer", parent=styles["Normal"],
                                      fontSize=8, textColor=colors.HexColor("#94a3b8"),
                                      alignment=TA_CENTER)
        story.append(Paragraph(
            "This is a computer-generated payslip and does not require a signature. "
            "For queries contact hr@softmastertechnology.com",
            footer_style
        ))

        doc.build(story)
        return buf.getvalue()

    except ImportError:
        # reportlab not installed – return a plain text fallback
        text = (
            f"SOFT MASTER TECHNOLOGY – PAY SLIP\n"
            f"{'='*40}\n"
            f"Employee : {employee.get('name','—')}\n"
            f"Emp ID   : {employee.get('emp_id','—')}\n"
            f"Period   : {payslip.get('month_label','—')}\n"
            f"{'─'*40}\n"
            f"Gross Pay    : Rs {payslip.get('gross_pay',0):,.2f}\n"
            f"Deductions   : Rs {payslip.get('deductions',0):,.2f}\n"
            f"NET PAY      : Rs {payslip.get('net_pay',0):,.2f}\n"
            f"{'='*40}\n"
            f"Status : {payslip.get('status','—')}\n"
        )
        return text.encode()


# GET /api/employee/payslips
@router.get("/employee/payslips")
async def get_payslips(payload: dict = Depends(require_employee)):
    db = get_db()
    pk = _get_emp_pk(db, payload["sub"])
    res = db.table("smt_payslips") \
            .select("*") \
            .eq("employee_id", pk) \
            .order("created_at", desc=True) \
            .execute()
    return res.data


# GET /api/employee/payslips/{id}/download  – download PDF
@router.get("/employee/payslips/{payslip_id}/download")
async def download_payslip(payslip_id: int, payload: dict = Depends(require_employee)):
    db = get_db()
    emp_pk = _get_emp_pk(db, payload["sub"])
    # Fetch payslip (must belong to this employee)
    ps_res = db.table("smt_payslips").select("*").eq("id", payslip_id).eq("employee_id", emp_pk).execute()
    if not ps_res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Payslip not found")
    payslip = ps_res.data[0]
    if payslip["status"] != "Paid":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only Paid payslips can be downloaded")
    # Fetch employee details
    emp_res = db.table("smt_employees").select("name,emp_id,role,dept,email").eq("id", emp_pk).execute()
    employee = emp_res.data[0] if emp_res.data else {}

    pdf_bytes = _generate_pdf(payslip, employee)
    filename = f"payslip_{employee.get('emp_id','emp')}_{payslip['month_label'].replace(' ','_')}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# GET /api/admin/payslips
@router.get("/admin/payslips", dependencies=[Depends(require_admin)])
async def admin_list_payslips():
    db = get_db()
    res = db.table("smt_payslips") \
            .select("*, smt_employees(emp_id, name)") \
            .order("created_at", desc=True) \
            .execute()
    return res.data


# POST /api/admin/payslips
@router.post("/admin/payslips", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_payslip(body: PayslipIn):
    db = get_db()
    pk = _get_emp_pk(db, body.emp_id)
    data = body.model_dump(exclude={"emp_id"})
    data["employee_id"] = pk
    res = db.table("smt_payslips").insert(data).execute()
    return res.data[0]


# PATCH /api/admin/payslips/{id}/status
@router.patch("/admin/payslips/{payslip_id}/status", dependencies=[Depends(require_admin)])
async def update_payslip_status(payslip_id: int, body: StatusIn):
    if body.status not in {"Paid", "Pending"}:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "status must be Paid or Pending")
    db = get_db()
    res = db.table("smt_payslips").update({"status": body.status}).eq("id", payslip_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Payslip not found")
    return {"ok": True}


# DELETE /api/admin/payslips/{id}
@router.delete("/admin/payslips/{payslip_id}", dependencies=[Depends(require_admin)])
async def delete_payslip(payslip_id: int):
    db = get_db()
    res = db.table("smt_payslips").delete().eq("id", payslip_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Payslip not found")
    return {"ok": True}
