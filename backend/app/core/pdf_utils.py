import os
import io
from pypdf import PdfReader, PdfWriter
from fpdf import FPDF
from PIL import Image

def generate_encrypted_pdf(item, user_dob: str, output_path: str):
    # Create the base PDF based on whether it's a file or text
    pdf_buffer = io.BytesIO()
    
    if item.file_path and os.path.exists(item.file_path):
        ext = os.path.splitext(item.file_path)[1].lower()
        if ext == '.pdf':
            # It's already a PDF, just read it
            with open(item.file_path, 'rb') as f:
                pdf_buffer.write(f.read())
        elif ext in ['.png', '.jpg', '.jpeg']:
            # Create a PDF containing the image
            pdf = FPDF()
            pdf.add_page()
            # We assume image can fit in page, basic handling
            pdf.image(item.file_path, x=10, y=10, w=190)
            pdf_bytes = pdf.output(dest='S')
            pdf_buffer.write(pdf_bytes)
        else:
            # Unsupported formats for direct PDF embedding: generate text informing about it
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font('Arial', '', 12)
            pdf.cell(200, 10, txt=f"File attached: {item.title}", ln=True, align='C')
            pdf.cell(200, 10, txt=f"Note: This file type ({ext}) cannot be previewed in this secure PDF.", ln=True, align='L')
            pdf_bytes = pdf.output(dest='S')
            pdf_buffer.write(pdf_bytes)
    else:
        # It's a payload-based item (text, bank details, etc)
        # Assuming payload is passed or we decrypt it in the caller
        pass # Handle this in the caller by passing the text

    # Now encrypt with pypdf
    pdf_buffer.seek(0)
    reader = PdfReader(pdf_buffer)
    writer = PdfWriter()
    
    for page in reader.pages:
        writer.add_page(page)
        
    writer.encrypt(user_dob)
    
    with open(output_path, "wb") as f:
        writer.write(f)

def generate_text_encrypted_pdf(title: str, text_content: str, user_dob: str, output_path: str):
    # Create PDF with text
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(200, 10, txt=title, ln=True, align='C')
    pdf.set_font('Arial', '', 12)
    # We could have newlines in text
    for line in text_content.split('\n'):
        pdf.multi_cell(0, 10, txt=line)
        
    pdf_bytes = pdf.output(dest='S')
    pdf_buffer = io.BytesIO(pdf_bytes)
    
    # Encrypt
    reader = PdfReader(pdf_buffer)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
        
    writer.encrypt(user_dob)
    
    with open(output_path, "wb") as f:
        writer.write(f)
