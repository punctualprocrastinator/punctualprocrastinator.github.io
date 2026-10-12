"""Build cv.pdf and resume-one-page.pdf from the HTML sources in this folder.

    python cv-source/build_pdfs.py

Serves the site root over HTTP (so the Libron webfonts load), prints each
source to PDF with headless Chrome, stamps title/author metadata, and
reports page counts. Edit cv.html / one-page.html, then rerun.
"""
import functools, http.server, os, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CHROME_CANDIDATES = [
    r"C:/Program Files/Google/Chrome/Application/chrome.exe",
    r"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome", "chromium",
]
JOBS = [  # source, output, title, maximum pages
    ("cv.html", "cv.pdf", "Shivam Dubey - Curriculum Vitae", 3),
    ("one-page.html", "resume-one-page.pdf", "Shivam Dubey - Resume", 1),
]

def chrome():
    for c in CHROME_CANDIDATES:
        if os.path.sep in c or "/" in c:
            if os.path.exists(c):
                return c
        else:
            return c
    sys.exit("No Chrome or Edge found; edit CHROME_CANDIDATES.")

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

def main():
    httpd = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    ok = True
    try:
        for src, out, title, max_pages in JOBS:
            dest = os.path.join(ROOT, out)
            subprocess.run([chrome(), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                            "--virtual-time-budget=4000", f"--print-to-pdf={dest}",
                            f"http://127.0.0.1:{port}/cv-source/{src}"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
            try:
                from pypdf import PdfReader, PdfWriter
                reader = PdfReader(dest)
                writer = PdfWriter(clone_from=reader)
                writer.add_metadata({"/Title": title, "/Author": "Shivam Dubey",
                                     "/Subject": "AI safety, mechanistic interpretability"})
                with open(dest, "wb") as fh:
                    writer.write(fh)
                pages = len(reader.pages)
                flag = "" if pages <= max_pages else f"  <-- over {max_pages} page(s)"
                ok &= pages <= max_pages
                print(f"{out:<24}{pages} page(s), {os.path.getsize(dest) // 1024} KB{flag}")
            except ImportError:
                print(f"{out:<24}written (install pypdf to stamp metadata and count pages)")
    finally:
        httpd.shutdown()
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
