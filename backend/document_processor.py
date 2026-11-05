import os
import re
import xml.etree.ElementTree as ET
import zipfile
from typing import List, Dict, Any

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pypdf or PyMuPDF with robust fallback."""
    text_content = []
    # 1. Try pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        for idx, page in enumerate(reader.pages):
            txt = page.extract_text()
            if txt and txt.strip():
                text_content.append(f"--- Page {idx + 1} ---\n{txt.strip()}")
        if text_content:
            return "\n\n".join(text_content)
    except Exception:
        pass

    # 2. Try fitz (PyMuPDF)
    try:
        import fitz
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                text_content.append(f"--- Page {page_num + 1} ---\n{text.strip()}")
        doc.close()
        if text_content:
            return "\n\n".join(text_content)
    except Exception:
        pass

    # 3. Fallback: stream text extraction
    try:
        with open(file_path, "rb") as f:
            content = f.read().decode("latin-1", errors="ignore")
            matches = re.findall(r"\(([\w\s.,!?'\"-]{4,})\)", content)
            if matches:
                text_content.append(" ".join(matches))
            else:
                text_content.append(f"[PDF Text extracted using basic parser: {os.path.basename(file_path)}]")
    except Exception as e:
        text_content.append(f"Error reading PDF: {str(e)}")

    return "\n\n".join(text_content) if text_content else "No text extracted from PDF."


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX using python-docx with pure Python zipfile fallback."""
    text_content = []
    try:
        import docx
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            if para.text.strip():
                text_content.append(para.text.strip())
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    text_content.append(" | ".join(row_text))
    except Exception:
        # Pure Python fallback: DOCX is an open XML zip package!
        try:
            with zipfile.ZipFile(file_path) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                for node in tree.iterfind(".//w:p", namespaces):
                    texts = [t.text for t in node.iterfind(".//w:t", namespaces) if t.text]
                    if texts:
                        text_content.append("".join(texts))
        except Exception as e:
            text_content.append(f"Error reading DOCX: {str(e)}")

    return "\n\n".join(text_content) if text_content else "No text extracted from DOCX."


def extract_document_text(file_path: str, filename: str) -> str:
    """Auto-detect format and extract text."""
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif lower_name.endswith(".docx") or lower_name.endswith(".doc"):
        return extract_text_from_docx(file_path)
    elif lower_name.endswith(".txt") or lower_name.endswith(".md"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    else:
        # Default try text read
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()


def chunk_text(text: str, doc_name: str, chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
    """
    Split extracted text into meaningful chunks for RAG.
    Preserves context and source metadata.
    """
    # Clean text
    clean = re.sub(r"\s+", " ", text).strip()
    words = clean.split(" ")
    if not words:
        return []

    chunks = []
    step = max(1, chunk_size - overlap)
    
    for i in range(0, len(words), step):
        chunk_words = words[i : i + chunk_size]
        chunk_str = " ".join(chunk_words).strip()
        if chunk_str:
            chunks.append({
                "chunk_id": f"{doc_name}_chunk_{len(chunks) + 1}",
                "doc_name": doc_name,
                "text": chunk_str,
                "word_count": len(chunk_words),
                "index": len(chunks) + 1
            })

    return chunks
