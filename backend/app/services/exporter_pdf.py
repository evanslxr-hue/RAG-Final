from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def write_pdf(path: str, title: str, sections: list[tuple[str, str]]) -> None:
    c = canvas.Canvas(path, pagesize=letter)
    w, h = letter
    y = h - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, title)
    y -= 30
    c.setFont("Helvetica", 11)
    for heading, body in sections:
        if y < 100:
            c.showPage()
            y = h - 50
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, heading)
        y -= 18
        c.setFont("Helvetica", 10)
        for line in body.split("\n"):
            if y < 80:
                c.showPage()
                y = h - 50
            c.drawString(60, y, line[:130])
            y -= 14
        y -= 8
    c.save()
