from bs4 import BeautifulSoup
import os

input_files = {
    "docs/reg_b_adverse_action.txt": "docs/clean_reg_b_adverse_action.txt",
    "docs/fair_lending_overview.txt": "docs/clean_fair_lending_overview.txt",
}

for input_path, output_path in input_files.items():
    with open(input_path, "rb") as f:
        raw_bytes = f.read()
    html = raw_bytes.decode("utf-8", errors="replace")

    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    text = soup.get_text(separator="\n")

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    clean_text = "\n".join(lines)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(clean_text)

    print(f"{input_path}: {len(html)} chars raw -> {output_path}: {len(clean_text)} chars clean")