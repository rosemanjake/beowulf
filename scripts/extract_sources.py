#!/usr/bin/env python3
"""Extract and clean public-domain / CC-BY-4.0 Beowulf texts into library/Beowulf/."""

import argparse
import html
import os
import re
from html.parser import HTMLParser


def extract_harrison_sharp(src_path, out_path):
    with open(src_path, "r", encoding="utf-8-sig") as f:
        txt = f.read().replace("\r\n", "\n")

    start = txt.index("I. THE PASSING OF SCYLD.")
    end = txt.index("lof-geornost.", start) + len("lof-geornost.")
    body = txt[start:end]

    parts = re.split(r"(?m)^([IVXLC]+)\.\s+([^\n]+)\n", body)
    chapters = []
    for i in range(1, len(parts), 3):
        ctext = parts[i + 2]
        cleaned_lines = []
        for raw in ctext.splitlines():
            if not raw.strip():
                continue
            # Strip 5-char margin (line numbers like '5    ', '3180 ', or 5 spaces)
            line = re.sub(r"^(?:\d+\s+|\s{5})", "", raw).rstrip()
            cleaned_lines.append(line)
        chapters.append("\n".join(cleaned_lines))

    assert len(chapters) == 43, f"Expected 43 chapters in Harrison & Sharp, got {len(chapters)}"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n<p>\n".join(chapters) + "\n")
    total_lines = sum(len(c.splitlines()) for c in chapters)
    print(f"[hs] Wrote {out_path}: {len(chapters)} chapters, {total_lines} lines")


class _SladeTableParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.table_depth = 0
        self.in_top_tr = False
        self.skip_note_div = 0
        self.curr_row = []
        self.curr_td = []
        self.rows = []

    def handle_starttag(self, tag, attrs):
        t = tag.lower()
        attr_map = dict(attrs)
        if t == "table":
            self.table_depth += 1
        elif t == "tr" and self.table_depth == 1:
            self.in_top_tr = True
            self.curr_row = []
        elif t == "td" and self.in_top_tr and self.table_depth == 1:
            self.curr_td = []
        elif t == "div" and attr_map.get("class") == "c14":
            self.skip_note_div += 1
        elif t == "br" and self.in_top_tr and not self.skip_note_div and len(self.curr_row) == 2:
            self.curr_td.append(" ")

    def handle_endtag(self, tag):
        t = tag.lower()
        if t == "div" and self.skip_note_div > 0:
            self.skip_note_div -= 1
        elif t == "td" and self.in_top_tr and self.table_depth == 1:
            self.curr_row.append("".join(self.curr_td))
        elif t == "tr" and self.in_top_tr and self.table_depth == 1:
            self.in_top_tr = False
            self.rows.append(self.curr_row)
        elif t == "table":
            self.table_depth -= 1

    def handle_data(self, data):
        if self.in_top_tr and not self.skip_note_div and len(self.curr_row) < 3:
            self.curr_td.append(data)

    def handle_entityref(self, name):
        if self.in_top_tr and not self.skip_note_div and len(self.curr_row) < 3:
            self.curr_td.append("\u00A0" if name == "nbsp" else html.unescape(f"&{name};"))

    def handle_charref(self, name):
        if self.in_top_tr and not self.skip_note_div and len(self.curr_row) < 3:
            self.curr_td.append(html.unescape(f"&#{name};"))


def _clean_slade_cell(cell):
    c = re.sub(r"[ \t\r\n]+", " ", cell)
    c = re.sub(r"\u00A0{2,}", "    ", c)
    c = c.replace("\u00A0", " ")
    c = re.sub(r" *    + *", "    ", c)
    c = re.sub(r"\*\*\s*\d+[^*]*\*\*", "", c)
    return c.strip()


def extract_slade(src_path, out_path):
    with open(src_path, "r", encoding="utf-8", errors="replace") as f:
        raw = f.read()

    parser = _SladeTableParser()
    parser.feed(raw)

    lines = []
    for row in parser.rows:
        oe = _clean_slade_cell(row[0]) if len(row) > 0 else ""
        en = _clean_slade_cell(row[2]) if len(row) > 2 else ""
        if en:
            lines.append(en)
        elif oe == "":
            # Line 2229 is an empty lacuna row in the manuscript table
            lines.append("[...]")

    assert len(lines) == 3182, f"Expected 3182 lines in Slade, got {len(lines)}"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"[slade] Wrote {out_path}: {len(lines)} lines")


def extract_scott_moncrieff(src_path, out_path):
    with open(src_path, "r", encoding="utf-8", errors="replace") as f:
        txt = f.read().replace("\r\n", "\n")

    m = re.search(r"WHAT\s*!\s*We\s+of\s+Spear-Danes", txt)
    start = m.start()
    end = txt.index("eager.", start) + len("eager.")
    body = txt[start:end]

    # Pre-split / OCR cleanups verified against second IA scan (moncrieff_1921) and Old English
    raw_lines = []
    for raw in body.splitlines():
        l = raw.strip()
        if not l:
            continue
        # Remove page numbers (1..104) and printer signatures (e.g. "17  i", "33  E", "49  F", "65  G", "81  c", "97  H")
        if re.match(r"^\d{1,3}$", l) and int(l) <= 120:
            continue
        if re.match(r"^\d{1,3}\s+[A-Za-z]$", l):
            continue
        # Remove stray OCR page numbers & ornaments
        if l in {"1C", "4*", "5'", "7'", "9'", "9*", "g°>", "[XXX]", "ii", "•"}:
            continue
        # Remove fitt Roman numeral headings (including OCR'd XL-Ill)
        if re.match(r"^[IVXLC]+(-[A-Za-z]+)?\.?$", l):
            continue

        # Strip leading margin line numbers (e.g., "10   ", "1 1 40   ", "131°   ", "i57°  ", "ioo   ", "*  50   ", "4*0   ", "8-10   ", "9so   ")
        l = re.sub(r"^\*\s+50\s+", "", l)
        l = re.sub(r"^(?:\d[\d\s°*i\-]{0,7}|ioo|i57°|9so)\s{2,}", "", l)
        l = re.sub(r"^(\d[\d\s]{1,5})\s+(?=[a-z])", "", l)  # e.g. "910 manhood," "220 The..."
        raw_lines.append(l)

    # Fix lines missing '/' or split/merged due to OCR before joining continuations
    fixed_raw = []
    i = 0
    while i < len(raw_lines):
        l = raw_lines[i]
        # Clean OCR glitches per line
        l = l.replace("Stepped  on  the  stem  ;  the  stream  was  washing",
                      "Stepped  on  the  stem  ;  /  the  stream  was  washing")
        l = l.replace("What  a  bout  of  gripping  j  to  Grendel  and  me",
                      "What  a  bout  of  gripping  /  to  Grendel  and  me")
        l = l.replace("Beowulf  answered,  Ecgtheow's  boy  :",
                      "Beowulf  answered,  /  Ecgtheow's  boy  :")
        l = l.replace("JTwas  not  long  thereafter", "'Twas  not  long  thereafter")
        l = l.replace("*Twas  one  of  the  foremost", "'Twas  one  of  the  foremost")
        l = l.replace("Twas  a  feud  beyond  fee", "'Twas  a  feud  beyond  fee")
        l = l.replace("J»Jor  have  I  heard", "Nor  have  I  heard")
        l = l.replace("J3pent  with  battle", "Spent  with  battle")
        l = l.replace("^Eschere", "Æschere").replace("^schere's", "Æschere's")
        l = l.replace("GrendePs", "Grendel's").replace("G  rendel's", "Grendel's")
        l = l.replace("Danes*", "Danes'").replace("Hugas*", "Hugas'")
        l = l.replace("hold/*", 'hold."').replace("blade>", "blade,")
        l = l.replace("many|a", "many a").replace("ha~tt", "hall")
        l = l.replace("hawJk", "hawk").replace("imrightly", "unrightly")
        l = l.replace("shewreth", "sheweth").replace("Forge tteth", "Forgetteth")
        l = l.replace("unf earing", "unfearing").replace("111  at  ease", "Ill  at  ease")
        l = l.replace("quothey", "quoth they")
        l = l.replace("Over 'the", "Over  the")
        l = l.replace("earls '-buckler", "earls'-buckler")
        l = l.replace("  »", "").replace("  •", "")
        l = re.sub(r"^\*\s+", '"  ', l)
        l = re.sub(r"^(?::>|\\)\s+", "", l)
        l = l.replace("*  Freawaru  '", '"Freawaru"')
        l = re.sub(r"(\w)\s+-\s+(\w)", r"\1-\2", l)
        l = re.sub(r"(\w)\s+-(?=\w)", r"\1-", l)
        l = re.sub(r"(\w)\s+'-(\w)", r"\1'-\2", l)

        # Merge two-line pairs where '/' fell between two printed lines (verified against Old English)
        if i + 1 < len(raw_lines):
            nxt = raw_lines[i + 1].strip()
            pair_splits = {
                ("Led  her  to  her  people.\"", "The  lay  was  sung,"),
                ("Held  that  field  of  slaughter.", "The  hall  filled  with  sound."),
                ("Of  massy  treasure.", "Moodiness  Thrytho  shewed,"),
                ("Or  fastness  in  friendship.", "Henceforth  shall  I  speak"),
                ("Felt  at  his  heart.", "The  hoard  of  joy  he  found,"),
                ("That  loathly  kindred.", "Nor  the  least  was  that"),
                ("Of  this  fleeting  life.", "JTwas  not  long  thereafter"),
                ("Is  known  afar.", "That  feud  was  shapen"),
                ("As  to  fate  or  fact.", "His  friends  all  arose  ;"),
                ("Humbling  and  slavery.", "Heaven  swallowed  the  reek."),
            }
            # Match collapsed spaces
            l_norm = re.sub(r"\s+", " ", l).strip()
            n_norm = re.sub(r"\s+", " ", nxt).strip()
            if (l_norm, n_norm) in {(re.sub(r"\s+", " ", a), re.sub(r"\s+", " ", b)) for a, b in pair_splits}:
                n_clean = n_norm.replace("JTwas", "'Twas")
                fixed_raw.append(f"{l} / {n_clean}")
                i += 2
                continue

        # Handle damaged MS folio 2228-2230:
        # 2228: "Whether in his wretchedness, /"
        # 2229: "[...]"
        # 2230: "/ While on him the fear pressed"
        if "Whether  in  his  wretchedness," in l:
            fixed_raw.append(l)
            fixed_raw.append("[...] / [...]")
            i += 1
            continue

        fixed_raw.append(l)
        i += 1

    # Join wrapped continuation lines onto preceding '/' line
    joined = []
    for l in fixed_raw:
        if "/" in l:
            joined.append(l)
        elif joined:
            joined[-1] = joined[-1] + " " + l
        else:
            joined.append(l)

    # Normalize spacing around caesura '/' and fix punctuation spacing
    final_lines = []
    for l in joined:
        parts = l.split("/", 1)
        left = re.sub(r"\s+", " ", parts[0]).strip()
        right = re.sub(r"\s+", " ", parts[1]).strip() if len(parts) > 1 else ""
        # Tidy spaces before punctuation (e.g. "days ;" -> "days;", " ?" -> "?")
        def tidy(s):
            s = re.sub(r"\s+([;:,?!.])", r"\1", s)
            s = re.sub(r'"\s+([A-Za-z0-9\'])', r'"\1', s)
            s = re.sub(r'([A-Za-z.,;!?])\s+"$', r'\1"', s)
            s = re.sub(r"\(\s+", "(", s)
            s = re.sub(r"\s+\)", ")", s)
            return s
        left = tidy(left)
        right = tidy(right)
        if left and right:
            final_lines.append(f"{left}  /  {right}")
        elif left:
            final_lines.append(f"{left}  /")
        else:
            final_lines.append(f"/  {right}")

    assert len(final_lines) == 3181, f"Expected 3181 lines in Scott Moncrieff, got {len(final_lines)}"

    # Split into 43 <p>-delimited chapters matching the 43 fitts (1 line shorter in Ch 37 where 2734-2735 merged)
    gumere2_path = os.path.join(os.path.dirname(out_path), "gumere2.html")
    with open(gumere2_path, "r", encoding="utf-8") as gf:
        raw_chaps = [c.strip() for c in gf.read().split("<p>") if c.strip()]
    chap_texts = []
    pos = 0
    for idx, ch in enumerate(raw_chaps, 1):
        n_lines = len([ln for ln in ch.splitlines() if ln.strip()])
        if idx == 37:
            n_lines -= 1
        chap_texts.append("\n".join(final_lines[pos : pos + n_lines]))
        pos += n_lines
    assert pos == len(final_lines), f"Chapter split consumed {pos} != {len(final_lines)}"

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n<p>\n".join(chap_texts) + "\n")
    print(f"[sm] Wrote {out_path}: {len(chap_texts)} chapters, {len(final_lines)} lines")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", default="/Users/jakeroseman/.gemini/antigravity/brain/a48abac3-8231-44f8-9c68-0a539806839a/scratch")
    parser.add_argument("--out-dir", default="library/Beowulf")
    args = parser.parse_args()

    extract_harrison_sharp(
        os.path.join(args.scratch, "9701-0.txt"),
        os.path.join(args.out_dir, "harrison_sharp.txt"),
    )
    extract_slade(
        os.path.join(args.scratch, "heorot_rede_text.html"),
        os.path.join(args.out_dir, "slade.txt"),
    )
    extract_scott_moncrieff(
        os.path.join(args.scratch, "moncrieff_uoft_djvu.txt"),
        os.path.join(args.out_dir, "scott_moncrieff.txt"),
    )


if __name__ == "__main__":
    main()
